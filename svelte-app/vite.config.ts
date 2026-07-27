/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Progressive Web App: installable + offline-capable, with NO intrusive
		// browser prompts. `registerType: 'autoUpdate'` means a new version is
		// applied silently on the next load (no "reload to update" toast), and
		// we deliberately ship no `beforeinstallprompt` UI — the app stays
		// installable through the browser's own passive affordance (the address
		// bar / menu "Install" entry) without ever nagging the visitor.
		SvelteKitPWA({
			registerType: 'autoUpdate',
			// Must mirror `export const trailingSlash = 'always'` in
			// src/routes/+layout.ts. The plugin defaults to 'never', which
			// precaches prerendered pages as `/artworks/foo` while the browser
			// navigates to `/artworks/foo/`. That misses the precache, falls
			// through to `navigateFallback` below, and serves the ROOT page —
			// whose relative `./_app/…` URLs then 404 under /artworks/foo/,
			// leaving every deep-linked page unstyled and mapless.
			kit: {
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
				// Precache the app shell ONLY — the JS/CSS bundles, the prerendered
				// HTML pages, and the manifest. The 400+ artwork images under
				// /images/** are intentionally excluded (precaching them would mean
				// downloading hundreds of MB on first visit); they are instead
				// cached on demand via runtimeCaching below.
				globPatterns: ['client/**/*.{js,css,webmanifest}', 'prerendered/**/*.html'],
				globIgnores: ['**/images/**'],
				// The maplibre-gl vendor chunk is large but worth precaching.
				maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
				// SvelteKit already content-hashes assets, so stop Workbox adding
				// its own cache-busting query onto those immutable URLs.
				dontCacheBustURLsMatching: /-[a-f0-9]{8}\./,
				// Offline fallback for any not-yet-visited route.
				navigateFallback: '/',
				runtimeCaching: [
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
						urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
						handler: 'StaleWhileRevalidate',
						options: { cacheName: 'google-fonts-stylesheets' }
					},
					{
						urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-webfonts',
							expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
			}
		})
	],
	build: {
		// The client bundle is dominated by maplibre-gl (~600 kB), which is
		// the whole point of this app — there's no UX win in lazy-loading it.
		// Raise the warning threshold so the build log stays clean.
		chunkSizeWarningLimit: 1200,
		// Suppress Rolldown's informational plugin-timings report. The timings
		// don't indicate a problem here — they're dominated by SvelteKit's own
		// build plugins, which we don't control.
		rollupOptions: {
			checks: {
				pluginTimings: false
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
