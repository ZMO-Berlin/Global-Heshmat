import adapter from '@sveltejs/adapter-static';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
		runes: ({ filename }) => {
			const relativePath = relative(import.meta.dirname, filename);
			const pathSegments = relativePath.toLowerCase().split(sep);
			const isExternalLibrary = pathSegments.includes('node_modules');

			return isExternalLibrary ? undefined : true;
		}
	},
	kit: {
		// Static output: prerenders the single route to plain HTML/JS so the
		// site can be hosted on any static host (GitHub Pages, Netlify,
		// Cloudflare Pages, S3, etc.). See https://svelte.dev/docs/kit/adapter-static.
		// `fallback` makes GitHub Pages serve our own 404 instead of its default.
		adapter: adapter({
			fallback: '404.html'
		}),
		// The PWA service worker is generated and registered by
		// `@vite-pwa/sveltekit` (see vite.config.ts + src/routes/+layout.svelte),
		// so disable SvelteKit's own service-worker handling to avoid conflicts.
		serviceWorker: {
			register: false
		}
	}
};

export default config;
