/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
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
