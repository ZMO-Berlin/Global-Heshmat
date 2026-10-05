/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rtlTextPluginPath = fileURLToPath(
	new URL('./node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js', import.meta.url)
);

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
for (const file of ['package-lock.json', 'vite.config.ts', 'svelte.config.js'])
	hash.update(readFileSync(file));
const revision =
	process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
hash.update(revision);
const buildId = hash.digest('hex').slice(0, 16);

export default defineConfig({
	define: { __BUILD_ID__: JSON.stringify(buildId), __REVISION__: JSON.stringify(revision) },
	plugins: [
		{
			name: 'emit-local-rtl-text-plugin',
			configureServer(server) {
				server.middlewares.use('/rtl-text-plugin.js', (_request, response) => {
					response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
					response.end(readFileSync(rtlTextPluginPath));
				});
			},
			generateBundle() {
				this.emitFile({
					type: 'asset',
					fileName: 'rtl-text-plugin.js',
					source: readFileSync(rtlTextPluginPath)
				});
			}
		},
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
		sveltekit(),
		// Progressive Web App: installable + offline-capable, with NO intrusive
		// browser prompts. `registerType: 'autoUpdate'` means a new version is
		// applied silently on the next load (no "reload to update" toast), and
		// we deliberately ship no `beforeinstallprompt` UI — the app stays
		// installable through the browser's own passive affordance (the address
		// bar / menu "Install" entry) without ever nagging the visitor.
		SvelteKitPWA({
			strategies: 'injectManifest',
			filename: 'sw.js',
			// adapter-static emits relative application asset URLs, but PWA files
			// live at the deployed origin root. Pin both integration bases so a
			// deep route registers /sw.js instead of /collection/sw.js.
			base: '/',
			scope: '/',
			// The lower Workbox limit below intentionally excludes the optional
			// map renderer. Keep that expected exclusion as a visible build warning
			// instead of treating it as a configuration error.
			showMaximumFileSizeToCacheInBytesWarning: true,
			registerType: 'autoUpdate',
			// Keep canonical cache paths aligned with the app's trailing-slash policy.
			kit: {
				// Required alongside the top-level PWA base: this controls how the
				// SvelteKit integration rewrites its intermediate client/ and
				// prerendered/ paths into deployed URLs.
				base: '/',
				trailingSlash: 'always'
			},
			// We call `registerSW()` ourselves from the root layout; 'auto'
			// detects that virtual-module import and skips injecting a second
			// registration (avoids double-registering the service worker).
			injectRegister: 'auto',
			manifest: {
				id: '/',
				name: 'Global Heshmat',
				short_name: 'Heshmat',
				description:
					'Interactive map tracing the public artworks of Egyptian sculptor Hassan Heshmat (1920–2006) across Egypt, Europe, and beyond. A project by ZMO Berlin.',
				lang: 'en',
				dir: 'ltr',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#16192e',
				background_color: '#ffffff',
				icons: [
					{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
					// Separate maskable entries so Android's shape mask crops the
					// padded variants, never the full-bleed "any" icons.
					{
						src: '/pwa-maskable-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/pwa-maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			injectManifest: {
				// Precache the shell and first-party fonts. Record documents and media
				// are saved on demand by src/service-worker.ts and the offline client.
				globPatterns: [
					'client/**/*.{js,css,webmanifest,woff2}',
					'client/offline/index.html',
					'prerendered/pages/index.html',
					'prerendered/pages/collection/index.html',
					'prerendered/pages/people/index.html',
					'prerendered/pages/missing/index.html',
					'prerendered/pages/fieldbook/index.html',
					'prerendered/pages/trails/index.html'
				],
				globIgnores: [
					'**/images/**',
					// The map is an optional view. Keep its large renderer and RTL
					// worker out of the install-time app shell and cache them on demand.
					'**/maplibre-*.js',
					'**/maplibre.*.css',
					'**/immutable/workers/**',
					'**/rtl-text-plugin.js'
				],
				// Vite 8 preserves the logical MapLibre name only in its manifest,
				// not in the emitted filename. Workbox's measured-size limit keeps
				// that optional 970 KiB renderer out of the install-time app shell
				// while retaining the SvelteKit integration's required URL transform.
				maximumFileSizeToCacheInBytes: 500 * 1024
			}
		})
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
		// (no browser environment needed) and import via the `$lib/*` alias
		// that the SvelteKit plugin sets up automatically.
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts']
	}
});
