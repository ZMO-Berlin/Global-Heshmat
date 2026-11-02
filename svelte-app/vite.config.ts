/// <reference types="vitest/config" />
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { readFileSync, readdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// A content-derived build ID also changes for uncommitted local builds. Saved
// documents must never outlive the JavaScript version that can hydrate them.
const hash = createHash('sha256');
function hashDirectory(dir: string) {
	for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name)
	)) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) hashDirectory(path);
		else {
			hash.update(path);
			hash.update(readFileSync(path));
		}
	}
}
hashDirectory('src');
for (const file of ['package-lock.json', 'vite.config.ts']) hash.update(readFileSync(file));
const revision =
	process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
hash.update(revision);
const buildId = hash.digest('hex').slice(0, 16);

// Progressive Web App: installable and offline-capable, with no browser
// prompts. Workbox precaches the app shell listed here; record documents and
// media are saved on demand by src/service-worker/index.ts and the offline client.
const OUTPUT = join('.svelte-kit', 'output');
const PRECACHED_PAGES = ['', 'collection', 'people', 'missing', 'fieldbook', 'trails'];
const PRECACHE_FILE = /\.(js|css|webmanifest|woff2)$/;
const PRECACHE_EXCLUDED = [
	/(^|\/)images\//,
	// The map is an optional view. Keep its renderer and worker out of the
	// install-time app shell and cache them on demand.
	/(^|\/)maplibre-[^/]*\.js$/,
	/(^|\/)maplibre\.[^/]*\.css$/,
	/\/immutable\/workers\//,
	// No rendered text falls in these subsets (unicode-range means pages never
	// request them); precaching them cost ~114 KB per install. Should such text
	// appear, it is still fetched on demand.
	/-(cyrillic|vietnamese)[^/]*\.woff2$/,
	/^(service-worker|sw)\.js$/
];
// Vite 8 keeps the logical MapLibre name only in its manifest, not in the
// emitted filename, so this size limit is what keeps that optional ~970 KiB
// renderer out of the app shell.
const PRECACHE_MAX_BYTES = 500 * 1024;

function precacheManifest() {
	const manifest: { url: string; revision: string | null }[] = [];
	const oversized: string[] = [];
	const add = (file: string, url: string) => {
		const content = readFileSync(join(OUTPUT, file));
		if (content.length > PRECACHE_MAX_BYTES) oversized.push(url);
		else
			manifest.push({
				url,
				// Hashed filenames already identify their content.
				revision: url.startsWith('_app/immutable/')
					? null
					: createHash('md5').update(content).digest('hex')
			});
	};
	for (const file of readdirSync(join(OUTPUT, 'client'), { recursive: true, encoding: 'utf8' })) {
		const url = file.split(sep).join('/');
		if (PRECACHE_FILE.test(url) && !PRECACHE_EXCLUDED.some((pattern) => pattern.test(url)))
			add(join('client', file), url);
	}
	add(join('client', 'offline', 'index.html'), 'offline/');
	for (const page of PRECACHED_PAGES)
		add(join('prerendered', 'pages', page, 'index.html'), page ? `${page}/` : '/');
	return { manifest, oversized };
}

// SvelteKit builds src/service-worker/ after prerendering, so the complete
// output is on disk when the worker's `self.__WB_MANIFEST` is replaced.
function serviceWorkerPrecache(): Plugin {
	return {
		name: 'service-worker-precache',
		apply: 'build',
		applyToEnvironment: (environment) => environment.name === 'serviceWorker',
		transform(code) {
			if (!code.includes('self.__WB_MANIFEST')) return;
			const { manifest, oversized } = precacheManifest();
			for (const url of oversized) this.warn(`${url} exceeds 500 KiB and is not precached`);
			return code.replaceAll('self.__WB_MANIFEST', JSON.stringify(manifest));
		},
		// Installed copies of the site check /sw.js for updates; keep that URL.
		writeBundle(options) {
			renameSync(join(options.dir!, 'service-worker.js'), join(options.dir!, 'sw.js'));
		}
	};
}

export default defineConfig({
	define: { __BUILD_ID__: JSON.stringify(buildId), __REVISION__: JSON.stringify(revision) },
	plugins: [
		{
			name: 'watch-image-originals',
			apply: 'serve',
			configureServer(server) {
				// Validation and fixtures also create Vite servers; only an interactive
				// development server should regenerate the committed image assets.
				if (
					process.env.VITEST ||
					server.config.mode === 'test' ||
					server.config.server.middlewareMode
				)
					return;

				const generatorPath = fileURLToPath(
					new URL('./scripts/generate_image_derivatives.mjs', import.meta.url)
				);
				const watcher = spawn(process.execPath, [generatorPath, '--watch'], { stdio: 'inherit' });
				const stopWatcher = () => watcher.kill();
				server.watcher.once('close', stopWatcher);
				process.once('exit', stopWatcher);
			}
		},
		sveltekit({
			compilerOptions: {
				// defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
				runes: ({ filename }) => {
					const relativePath = relative(import.meta.dirname, filename);
					const pathSegments = relativePath.toLowerCase().split(sep);
					const isExternalLibrary = pathSegments.includes('node_modules');

					return isExternalLibrary ? undefined : true;
				}
			},

			// Inline small route styles while keeping the larger shared stylesheet cacheable.
			inlineStyleThreshold: 16384,

			// Static output: prerenders the single route to plain HTML/JS so the
			// site can be hosted on any static host (GitHub Pages, Netlify,
			// Cloudflare Pages, S3, etc.). See https://svelte.dev/docs/kit/adapter-static.
			// `fallback` makes GitHub Pages serve our own 404 instead of its default.
			adapter: adapter({ fallback: '404.html' }),

			// src/lib/offline/register.ts registers the worker at /sw.js (see
			// serviceWorkerPrecache below), so SvelteKit's own registration is off.
			serviceWorker: { register: false }
		}),
		serviceWorkerPrecache()
	],
	build: {
		// MapLibre is intentionally lazy and isolated from the grid-first route.
		// Its renderer remains a large optional chunk, so keep the threshold high
		// enough that warnings still identify unexpected non-map growth.
		chunkSizeWarningLimit: 1200,
		// Suppress Rolldown's informational plugin-timings report. The timings
		// don't indicate a problem here — they're dominated by SvelteKit's own
		// build plugins, which we don't control.
		rolldownOptions: {
			checks: {
				pluginTimings: false
			},
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'maplibre',
							test: /node_modules[\\/]maplibre-gl/
						}
					]
				}
			}
		}
	},
	test: {
		// Pure unit tests for the SEO/URL/sitemap layer. They run in Node
		// (no browser environment needed) and import via the `#lib/*` alias
		// that the SvelteKit plugin sets up automatically.
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts']
	}
});
