/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rtlTextPluginPath = fileURLToPath(
	new URL('./node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js', import.meta.url)
);

export default defineConfig({
	plugins: [
		{
			name: 'emit-local-rtl-text-plugin',
			apply: 'build',
			generateBundle() {
				this.emitFile({
					type: 'asset',
					fileName: 'rtl-text-plugin.js',
					source: readFileSync(rtlTextPluginPath)
				});
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
			// Must mirror `export const trailingSlash = 'always'` in
			// src/routes/+layout.ts. The plugin defaults to 'never', which
			// precaches prerendered pages as `/artworks/foo` while the browser
			// navigates to `/artworks/foo/`. That misses the precache, falls
			// through to `navigateFallback` below, and serves the ROOT page —
			// whose relative `./_app/…` URLs then 404 under /artworks/foo/,
			// leaving every deep-linked page unstyled and mapless.
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
			workbox: {
				// Precache the app shell ONLY — JS/CSS, the two primary entry pages,
				// and the manifest. Detail pages remain network-first instead of all
				// 43 being downloaded during installation. The 400+ artwork images under
				// /images/** are intentionally excluded (precaching them would mean
				// downloading hundreds of MB on first visit); they are instead
				// cached on demand via runtimeCaching below.
				globPatterns: [
					'client/**/*.{js,css,webmanifest}',
					'prerendered/pages/index.html',
					'prerendered/pages/collection/index.html'
				],
				globIgnores: [
					'**/images/**',
					// The map is an optional view. Keep its large renderer and RTL
					// worker out of the install-time app shell and cache them on demand.
					'**/maplibre-*.js',
					'**/maplibre.*.css',
					'**/rtl-text-plugin.js'
				],
				// Vite 8 preserves the logical MapLibre name only in its manifest,
				// not in the emitted filename. Workbox's measured-size limit keeps
				// that optional 970 KiB renderer out of the install-time app shell
				// while retaining the SvelteKit integration's required URL transform.
				maximumFileSizeToCacheInBytes: 500 * 1024,
				// Offline fallback for any not-yet-visited route.
				navigateFallback: '/',
				runtimeCaching: [
					{
						urlPattern: ({ url, sameOrigin }) =>
							sameOrigin &&
							((url.pathname.includes('/_app/immutable/chunks/') && url.pathname.endsWith('.js')) ||
								(url.pathname.includes('/maplibre.') && url.pathname.endsWith('.css')) ||
								url.pathname.endsWith('/rtl-text-plugin.js')),
						handler: 'CacheFirst',
						options: {
							cacheName: 'map-renderer-v1',
							expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						// Artwork images — respond with the cached image immediately
						// but revalidate in the background so clients get fresher
						// derivatives without forcing a full reload.
						urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/images/'),
						handler: 'StaleWhileRevalidate',
						options: {
							// Bump the cache name to force a fresh cache when the
							// service worker updates — this avoids serving stale
							// image files with identical URLs.
							cacheName: 'artwork-images-v2',
							expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						// Cache previously viewed map regions and style assets. A cold
						// offline visit still degrades to the collection list.
						urlPattern: ({ url }) =>
							url.hostname === 'cartocdn.com' || url.hostname.endsWith('.cartocdn.com'),
						handler: 'CacheFirst',
						options: {
							cacheName: 'carto-map-assets-v1',
							expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
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
