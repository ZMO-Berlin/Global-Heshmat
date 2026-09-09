#!/usr/bin/env node
/**
 * Generate the WebP derivatives the site actually serves.
 *
 * Source of truth is `originals/` (outside `static/`, so the multi-megabyte
 * masters never ship). For each image this writes four sizes into
 * `static/images/`, all keeping the original's stem with a `.webp` extension:
 *
 *   thumb/   400px — thumbnail strips in the gallery and lightbox
 *   preview/ 800px — mobile album and collection intermediate candidate
 *   web/    1200px — the sidebar gallery, and the small srcset candidate
 *   full/   2000px — the lightbox on large and high-DPI displays
 *
 * Content and encoder fingerprints avoid rebuilding unchanged sources.
 * Outputs are replaced only after a successful encode.
 *
 * Run with: npm run images
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { VARIANTS, imageStem as stem, assertUniqueStems } from './image-variants.mjs';
import { generateImageManifest } from './image-manifest.mjs';
import { readdir, readFile, writeFile, open, rename, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync, watch as fsWatch } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ORIGINALS_DIR = join(ROOT, 'originals');
const IMAGES_DIR = join(ROOT, 'static', 'images');
const WATCH_MODE = process.argv.includes('--watch');

if (!existsSync(ORIGINALS_DIR)) mkdirSync(ORIGINALS_DIR, { recursive: true });

/**
 * Keep in sync with `src/lib/utils/image.ts`, which builds the URLs, and with
 * `src/lib/data/data-integrity.test.ts`, which asserts every referenced image
 * has all three derivatives on disk.
 */

for (const { dir } of VARIANTS) {
	const path = join(IMAGES_DIR, dir);
	if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

// NFC on the way out: several masters were added from macOS with decomposed
// umlauts, and a decomposed filename percent-encodes to a URL that static
// hosts resolving in NFC answer 404 for. The served names are normalised even
// though the masters in originals/ keep whatever form they arrived with.

const LFS_MAGIC = 'version https://git-lfs.github.com/spec/v1';

/**
 * True when the file on disk is a Git LFS pointer rather than the image.
 *
 * originals/ is LFS-tracked going forward (see .gitattributes), and CI checks
 * out without LFS content because nothing in the build reads image bytes. So a
 * fresh clone can hold pointers, and sharp would report a confusing decode
 * error rather than the real problem.
 */
async function isLfsPointer(path) {
	const handle = await open(path, 'r');
	try {
		const { buffer, bytesRead } = await handle.read(
			Buffer.alloc(LFS_MAGIC.length),
			0,
			LFS_MAGIC.length,
			0
		);
		return bytesRead === LFS_MAGIC.length && buffer.toString('utf8') === LFS_MAGIC;
	} finally {
		await handle.close();
	}
}

/** Largest variant — the fallback source when a master won't decode. */
const LARGEST = VARIANTS.reduce((a, b) => (b.size > a.size ? b : a));

/** Encoder changes invalidate the content cache as well. */
const CACHE_FILE = join(ROOT, '.image-build-cache.json');
const signature = JSON.stringify({ VARIANTS, sharp: sharp.versions, pipeline: 2 });
const fingerprint = (buffer) => createHash('sha256').update(signature).update(buffer).digest('hex');

/**
 * `failOn: 'none'` keeps sharp from treating recoverable decoder warnings as
 * errors. Some masters in this archive are scanner TIFFs that emit per-tile
 * warnings but decode fine, and rejecting them would silently drop artwork
 * photos from the site.
 */
function decode(path) {
	return sharp(path, { failOn: 'none' }).rotate(); // rotate() honours EXIF orientation
}

async function render(source, outPath, size, quality) {
	const temporary = `${outPath}.${process.pid}.tmp`;
	try {
		await decode(source)
			.resize(size, size, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality, effort: 6 })
			.toFile(temporary);
		await rename(temporary, outPath);
	} finally {
		await rm(temporary, { force: true });
	}
}

function debounce(fn, delayMs) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delayMs);
	};
}

async function generateDerivatives() {
	const files = await readdir(ORIGINALS_DIR);
	const imageFiles = files.filter((f) => /\.(jpe?g|png|tiff?|webp|heic|heif)$/i.test(f));
	assertUniqueStems(imageFiles);
	const cache = JSON.parse(await readFile(CACHE_FILE, 'utf8').catch(() => '{}'));

	console.log(`Found ${imageFiles.length} images in originals/`);
	let written = 0;
	let skipped = 0;
	let failed = 0;

	const pointers = [];
	for (const file of imageFiles) {
		const inputPath = join(ORIGINALS_DIR, file);
		const baseStem = stem(file);

		if (await isLfsPointer(inputPath)) {
			pointers.push(file);
			continue;
		}

		const hash = fingerprint(await readFile(inputPath));
		const failedBefore = failed;
		for (const { dir, size, quality } of VARIANTS) {
			const outPath = join(IMAGES_DIR, dir, `${baseStem}.webp`);
			if (cache[baseStem] === hash && existsSync(outPath)) {
				skipped++;
				continue;
			}
			console.log(`  → ${dir}: ${file}`);
			try {
				await render(inputPath, outPath, size, quality);
				written++;
			} catch (err) {
				// A handful of masters in this archive don't decode at all — an
				// iPhone HEIC that trips libheif's reference-count limit, for
				// instance. Rather than dropping the photo, fall back to the
				// largest derivative we already hold, which is a clean WebP.
				const fallback = join(IMAGES_DIR, LARGEST.dir, `${baseStem}.webp`);
				if (dir !== LARGEST.dir && existsSync(fallback)) {
					try {
						await render(fallback, outPath, size, quality);
						console.log(`    (rebuilt from ${LARGEST.dir}/ — master would not decode)`);
						written++;
						continue;
					} catch {
						// fall through to the error report below
					}
				}
				console.error(`  ✗ ${dir}: ${file} — ${err.message}`);
				failed++;
			}
		}
		if (failed === failedBefore) cache[baseStem] = hash;
	}
	await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
	await generateImageManifest();

	if (pointers.length > 0) {
		console.error(
			`\n${pointers.length} file(s) in originals/ are Git LFS pointers, not images.\n` +
				`Run \`git lfs pull\` to download them, then re-run \`npm run images\`.\n` +
				`  e.g. ${pointers.slice(0, 3).join(', ')}`
		);
		failed += pointers.length;
	}

	console.log(`\n${written} written, ${skipped} already up to date, ${failed} failed`);
	// Exit non-zero on any failure so a CI or manual invocation notices.
	if (failed > 0) process.exitCode = 1;
}

async function watchForChanges() {
	let running = false;
	let pending = false;
	async function drain() {
		if (running) {
			pending = true;
			return;
		}
		running = true;
		try {
			do {
				pending = false;
				await generateDerivatives();
			} while (pending);
		} finally {
			running = false;
		}
	}
	const runSoon = debounce(() => {
		drain().catch((err) => {
			console.error('Error:', err.message);
			process.exit(1);
		});
	}, 500);

	const watcher = fsWatch(ORIGINALS_DIR, { persistent: true }, (_eventType, filename) => {
		if (!filename) return;
		if (!/\.(jpe?g|png|tiff?|webp|heic|heif)$/i.test(filename)) return;
		runSoon();
	});

	console.log(`Watching ${ORIGINALS_DIR} for new JPG/PNG uploads...`);
	process.on('SIGINT', () => {
		watcher.close();
		process.exit(0);
	});
}

async function main() {
	if (WATCH_MODE) {
		await generateDerivatives();
		await watchForChanges();
		return;
	}

	await generateDerivatives();
}

main().catch((err) => {
	console.error('Error:', err.message);
	process.exit(1);
});
