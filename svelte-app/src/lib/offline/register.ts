import { dev } from '$app/env';

/**
 * Registers the Workbox worker built from src/service-worker/ at /sw.js. Every
 * build's worker takes over at once (skipWaiting + clientsClaim), so a page an
 * older worker controlled reloads onto the new build: there is no "reload to
 * update" toast and no `beforeinstallprompt` UI. The app stays installable
 * through the browser's own passive affordance.
 */
export function registerSW({ immediate = false } = {}): void {
	// The worker exists only in builds (`npm run build && npm run preview`).
	if (dev || !('serviceWorker' in navigator)) return;
	void import('workbox-window')
		.then(({ Workbox }) => {
			// Root-scoped from any route: adapter-static emits relative asset URLs.
			const worker = new Workbox('/sw.js', { scope: '/' });
			worker.addEventListener('activated', (event) => {
				if (event.isUpdate || event.isExternal) window.location.reload();
			});
			return worker.register({ immediate });
		})
		// The offline client reports a worker that never becomes ready.
		.catch(() => {});
}
