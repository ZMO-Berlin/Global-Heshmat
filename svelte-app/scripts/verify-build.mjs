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
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`\nverify-build: ${successes.length} passed, ${failures.length} failed`);
for (const s of successes) console.log(`  ✓ ${s}`);
for (const f of failures) console.error(`  ✗ ${f}`);

if (failures.length > 0) {
	process.exit(1);
}
