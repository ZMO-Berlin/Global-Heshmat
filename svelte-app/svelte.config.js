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
		adapter: adapter()
	}
};

export default config;
