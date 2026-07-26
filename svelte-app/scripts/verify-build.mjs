#!/usr/bin/env node
/**
 * Post-build assertion script.
 *
 * Run AFTER `npm run build`. It cracks open the static `build/` directory
 * and checks that the prerendered output actually contains the SEO and
 * sitemap content we expect — the kind of breakage that wouldn't surface
 * in a Vitest unit test (e.g. SSR getting accidentally disabled, the
 * verification meta tag falling out of app.html, the canonical URL
 * pointing at the wrong origin, sitemap.xml not being prerendered).
 *
 * Exits non-zero on the first failed check so CI fails loudly.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');
const SITE_URL = 'https://heshmat.zmo.de';
const GSC_TOKEN = '1aKyIJ72yL1xMnld8KUqFhs22MJ1eWMLtBTplNtvEyU';

const failures = [];
const successes = [];

function check(name, condition, detail = '') {
	if (condition) {
		successes.push(name);
	} else {
		failures.push(detail ? `${name} — ${detail}` : name);
	}
}

function read(relPath) {
	return readFileSync(join(BUILD_DIR, relPath), 'utf8');
}

// ── Build directory exists ──────────────────────────────────────────
if (!existsSync(BUILD_DIR)) {
	console.error(`build/ not found at ${BUILD_DIR}. Run "npm run build" first.`);
	process.exit(2);
}

// ── Site-wide assets ────────────────────────────────────────────────
check('CNAME present', existsSync(join(BUILD_DIR, 'CNAME')));
check(
	'CNAME points at heshmat.zmo.de',
	existsSync(join(BUILD_DIR, 'CNAME')) && read('CNAME').trim() === 'heshmat.zmo.de'
);

check('robots.txt present', existsSync(join(BUILD_DIR, 'robots.txt')));
check(
	'robots.txt advertises the sitemap',
	existsSync(join(BUILD_DIR, 'robots.txt')) &&
		read('robots.txt').includes(`Sitemap: ${SITE_URL}/sitemap.xml`)
);

check('404.html present', existsSync(join(BUILD_DIR, '404.html')));

// The social-preview image referenced by every page's og:image/twitter:image
// (see src/lib/components/Seo.svelte) must actually ship in the build.
check('og-image.png present', existsSync(join(BUILD_DIR, 'og-image.png')));

// ── Home page SEO ───────────────────────────────────────────────────
check('index.html present', existsSync(join(BUILD_DIR, 'index.html')));

if (existsSync(join(BUILD_DIR, 'index.html'))) {
	const home = read('index.html');
	check('home title includes the site name', /<title>[^<]*Global Heshmat[^<]*<\/title>/.test(home));
	check(
		'home has exactly one <title> tag',
		(home.match(/<title>/g) ?? []).length === 1,
		`saw ${(home.match(/<title>/g) ?? []).length}`
	);
	check(
		'home canonical points at the site root',
		new RegExp(`rel="canonical"\\s+href="${SITE_URL}/"`).test(home)
	);
	check(
		'home og:url is the site root',
		new RegExp(`property="og:url"\\s+content="${SITE_URL}/"`).test(home)
	);
	check(
		'home JSON-LD declares @type WebSite',
		/<script type="application\/ld\+json">[^<]*"@type":"WebSite"/.test(home)
	);
	check(
		'home includes Google Search Console verification meta',
		new RegExp(`name="google-site-verification"[^>]*content="${GSC_TOKEN}"`).test(home)
	);
	check(
		'home og:image points at the shipped og-image.png',
		new RegExp(`property="og:image"\\s+content="${SITE_URL}/og-image.png"`).test(home)
	);
	check(
		'home does not leak localhost URLs',
		!home.includes('localhost') && !home.includes('127.0.0.1')
	);
}

// ── Sitemap ─────────────────────────────────────────────────────────
check('sitemap.xml present', existsSync(join(BUILD_DIR, 'sitemap.xml')));

if (existsSync(join(BUILD_DIR, 'sitemap.xml'))) {
	const sitemap = read('sitemap.xml');
	check(
		'sitemap declares the urlset namespace',
		sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
	);
	check('sitemap lists the home URL', sitemap.includes(`<loc>${SITE_URL}/</loc>`));

	// Every artwork directory should appear in the sitemap.
	const artworksDir = join(BUILD_DIR, 'artworks');
	const slugs = existsSync(artworksDir)
		? readdirSync(artworksDir, { withFileTypes: true })
				.filter((d) => d.isDirectory())
				.map((d) => d.name)
		: [];

	for (const slug of slugs) {
		check(
			`sitemap lists /artworks/${slug}/`,
			sitemap.includes(`<loc>${SITE_URL}/artworks/${slug}/</loc>`)
		);
	}

	// ── Per-artwork SEO (sample the first one) ──────────────────────
	if (slugs.length > 0) {
		const sample = slugs[0];
		const html = read(join('artworks', sample, 'index.html'));
		check(
			`artwork page /${sample}/ has exactly one <title>`,
			(html.match(/<title>/g) ?? []).length === 1
		);
		check(
			`artwork page /${sample}/ canonical points at the artwork URL`,
			new RegExp(`rel="canonical"\\s+href="${SITE_URL}/artworks/${sample}/"`).test(html)
		);
		check(
			`artwork page /${sample}/ JSON-LD declares @type VisualArtwork`,
			/<script type="application\/ld\+json">[^<]*"@type":"VisualArtwork"/.test(html)
		);
		check(
			`artwork page /${sample}/ og:type is "article"`,
			/property="og:type"\s+content="article"/.test(html)
		);
		check(
			`artwork page /${sample}/ includes the GSC verification meta`,
			new RegExp(`name="google-site-verification"[^>]*content="${GSC_TOKEN}"`).test(html)
		);
	} else {
		successes.push(
			'no artwork pages to check (artworks folder is empty — skipping per-artwork assertions)'
		);
	}

	// Every residence directory should appear in the sitemap.
	const residencesDir = join(BUILD_DIR, 'residences');
	const resSlugs = existsSync(residencesDir)
		? readdirSync(residencesDir, { withFileTypes: true })
				.filter((d) => d.isDirectory())
				.map((d) => d.name)
		: [];

	for (const slug of resSlugs) {
		check(
			`sitemap lists /residences/${slug}/`,
			sitemap.includes(`<loc>${SITE_URL}/residences/${slug}/</loc>`)
		);
	}

	// ── Per-residence SEO (sample the first one) ────────────────────
	if (resSlugs.length > 0) {
		const sample = resSlugs[0];
		const html = read(join('residences', sample, 'index.html'));
		check(
			`residence page /${sample}/ has exactly one <title>`,
			(html.match(/<title>/g) ?? []).length === 1
		);
		check(
			`residence page /${sample}/ canonical points at the residence URL`,
			new RegExp(`rel="canonical"\\s+href="${SITE_URL}/residences/${sample}/"`).test(html)
		);
		check(
			`residence page /${sample}/ JSON-LD declares @type Place`,
			/<script type="application\/ld\+json">[^<]*"@type":"Place"/.test(html)
		);
		check(
			`residence page /${sample}/ og:type is "article"`,
			/property="og:type"\s+content="article"/.test(html)
		);
		check(
			`residence page /${sample}/ includes the GSC verification meta`,
			new RegExp(`name="google-site-verification"[^>]*content="${GSC_TOKEN}"`).test(html)
		);
	} else {
		successes.push(
			'no residence pages to check (residences folder is empty — skipping per-residence assertions)'
		);
	}
}

// ── Artwork + residence image references resolve to WebP derivatives ──
//
// Each artwork/residence data file references images by their ORIGINAL
// filename (e.g. "Foo Bar.jpeg"). At runtime the app (src/lib/utils/image.ts)
// loads the generated derivatives at /images/{thumb,web,full}/<stem>.webp,
// swapping the extension for .webp. This guards the filename-drift class of
// bug: a reference whose stem has no matching derivative — a typo, wrong case,
// space-vs-underscore, NFC/NFD Unicode mismatch, or simply forgetting to run
// `npm run images` after adding an image.
const DATA_ROOT = join(__dirname, '..', 'src', 'lib', 'data');
const DATA_DIRS = [join(DATA_ROOT, 'artworks'), join(DATA_ROOT, 'residences')];
// Keep in sync with VARIANTS in scripts/generate_image_derivatives.mjs.
const VARIANT_DIRS = ['thumb', 'web', 'full'];
const variantPath = (name) => join(BUILD_DIR, 'images', name);

// Referenced filenames whose SOURCE image is not on disk yet (a colleague
// still needs to supply them). Tracked here so the build stays green while
// the gap stays visible — add an entry to silence a known gap, and delete it
// once the file is added and the derivative script has been re-run.
// Currently empty: the three formerly-missing sources are all resolved —
// Intilaqat_Misr_Abbau.jpg (005) and The_stable_family.jpg (032) were supplied
// and now have derivatives; Schule_Plan.jpg (024) is no longer referenced.
const KNOWN_MISSING = new Set([]);

// Mirror the stem logic in src/lib/utils/image.ts.
const stemOf = (file) => file.replace(/\.[^./\\]+$/, '');
const IMG_EXT = /\.(?:jpe?g|png|webp|tiff?|heic|heif)$/i;
const REF_RE = /(?:src|image)\s*:\s*["']([^"']+)["']/g;

const allVariantDirsPresent = VARIANT_DIRS.every((d) => existsSync(variantPath(d)));

check(
	`image derivative folders present in build (${VARIANT_DIRS.join(' + ')})`,
	allVariantDirsPresent,
	'run `npm run images` and commit static/images/'
);

if (allVariantDirsPresent) {
	const variantSets = VARIANT_DIRS.map((d) => [d, new Set(readdirSync(variantPath(d)))]);

	let refCount = 0;
	let knownMissingSeen = 0;
	const broken = [];

	for (const dir of DATA_DIRS.filter(existsSync)) {
		const dataFiles = readdirSync(dir).filter(
			(f) => f.endsWith('.ts') && f !== '_template.ts' && f !== 'index.ts'
		);
		for (const file of dataFiles) {
			const text = readFileSync(join(dir, file), 'utf8');
			for (const m of text.matchAll(REF_RE)) {
				const name = m[1];
				if (!IMG_EXT.test(name)) continue; // ignore non-image strings
				if (KNOWN_MISSING.has(name)) {
					knownMissingSeen++;
					continue;
				}
				refCount++;
				const webp = stemOf(name) + '.webp';
				const absent = variantSets.filter(([, set]) => !set.has(webp)).map(([d]) => `${d}/`);
				if (absent.length > 0) {
					broken.push(`${file}: "${name}" → missing ${webp} in ${absent.join(' and ')}`);
				}
			}
		}
	}

	if (broken.length === 0) {
		successes.push(`all ${refCount} artwork + residence image references have WebP derivatives`);
	} else {
		for (const b of broken) failures.push(`image reference unresolved — ${b}`);
	}

	if (knownMissingSeen > 0) {
		successes.push(
			`${knownMissingSeen} known-missing image reference(s) tracked in KNOWN_MISSING (not failing the build)`
		);
	}
}

// ── Artwork video references resolve to a file in build/videos/ ──────
//
// Mirror of the image check above, for self-hosted <video> clips. Data files
// reference a clip by filename (videoFile: "X.mp4"); the app serves it from
// /videos/X.mp4 (static/videos is copied verbatim into build/). Guards the
// same filename-drift / forgot-to-add-the-file class of bug for videos.
const VIDEOS_DIR = join(BUILD_DIR, 'videos');
const VID_REF_RE = /videoFile\s*:\s*["']([^"']+)["']/g;
const videoSet = existsSync(VIDEOS_DIR) ? new Set(readdirSync(VIDEOS_DIR)) : new Set();
let vidRefCount = 0;
const brokenVideos = [];

for (const dir of DATA_DIRS.filter(existsSync)) {
	const dataFiles = readdirSync(dir).filter(
		(f) => f.endsWith('.ts') && f !== '_template.ts' && f !== 'index.ts'
	);
	for (const file of dataFiles) {
		const text = readFileSync(join(dir, file), 'utf8');
		for (const m of text.matchAll(VID_REF_RE)) {
			vidRefCount++;
			if (!videoSet.has(m[1])) {
				brokenVideos.push(`${file}: "${m[1]}" → missing videos/${m[1]}`);
			}
		}
	}
}

if (vidRefCount === 0) {
	successes.push('no artwork video references to check');
} else if (brokenVideos.length === 0) {
	successes.push(`all ${vidRefCount} artwork video reference(s) resolve to build/videos/`);
} else {
	for (const b of brokenVideos) failures.push(`video reference unresolved — ${b}`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`\nverify-build: ${successes.length} passed, ${failures.length} failed`);
for (const s of successes) console.log(`  ✓ ${s}`);
for (const f of failures) console.error(`  ✗ ${f}`);

if (failures.length > 0) {
	process.exit(1);
}
