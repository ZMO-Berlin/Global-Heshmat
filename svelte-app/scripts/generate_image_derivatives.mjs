#!/usr/bin/env node
/**
 * Generate WebP image derivatives using Node.js + sharp
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ORIGINALS_DIR = join(ROOT, 'originals');
const WEB_DIR = join(ROOT, 'static', 'images', 'web');
const THUMB_DIR = join(ROOT, 'static', 'images', 'thumb');

const WEB_SIZE = 2000;
const THUMB_SIZE = 400;

// Ensure output directories exist
[WEB_DIR, THUMB_DIR].forEach((dir) => {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
});

const stem = (file) => file.replace(/\.[^./\\]+$/, '');

async function generateDerivatives() {
	try {
		const files = await readdir(ORIGINALS_DIR);
		const imageFiles = files.filter((f) =>
			/\.(jpe?g|png|tiff?|webp|heic|heif)$/i.test(f)
		);

		console.log(`Found ${imageFiles.length} images to process`);

		for (const file of imageFiles) {
			const inputPath = join(ORIGINALS_DIR, file);
			const baseStem = stem(file);
			const webPath = join(WEB_DIR, `${baseStem}.webp`);
			const thumbPath = join(THUMB_DIR, `${baseStem}.webp`);

			try {
				// Check if derivatives are newer than source
				let skipWeb = false,
					skipThumb = false;

				if (existsSync(webPath)) {
					const srcStat = await stat(inputPath);
					const webStat = await stat(webPath);
					skipWeb = webStat.mtime > srcStat.mtime;
				}

				if (existsSync(thumbPath)) {
					const srcStat = await stat(inputPath);
					const thumbStat = await stat(thumbPath);
					skipThumb = thumbStat.mtime > srcStat.mtime;
				}

				// Generate web derivative
				if (!skipWeb) {
					console.log(`  → web: ${file}`);
					await sharp(inputPath)
						.rotate() // Handle EXIF orientation
						.resize(WEB_SIZE, WEB_SIZE, {
							fit: 'inside',
							withoutEnlargement: true
						})
						.webp({ quality: 80 })
						.toFile(webPath);
				}

				// Generate thumb derivative
				if (!skipThumb) {
					console.log(`  → thumb: ${file}`);
					await sharp(inputPath)
						.rotate() // Handle EXIF orientation
						.resize(THUMB_SIZE, THUMB_SIZE, {
							fit: 'inside',
							withoutEnlargement: true
						})
						.webp({ quality: 75 })
						.toFile(thumbPath);
				}

				if (skipWeb && skipThumb) {
					console.log(`  ✓ up-to-date: ${file}`);
				}
			} catch (err) {
				console.error(`  ✗ error processing ${file}:`, err.message);
			}
		}

		console.log('✓ Done generating derivatives');
	} catch (err) {
		console.error('Error:', err.message);
		process.exit(1);
	}
}

generateDerivatives();
