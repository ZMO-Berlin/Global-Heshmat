/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
	canonicalEntryPath,
	entryCacheName,
	savedCachePrefix,
	obsoleteDocumentCache,
	documentMatchesVersion
} from './lib/offline/keys';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};
const version = __BUILD_ID__;
const documents = entryCacheName(version);
const savedPrefix = savedCachePrefix(version);
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/.*/] });
cleanupOutdatedCaches();
void self.skipWaiting();
clientsClaim();
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => obsoleteDocumentCache(name, version))
						.map((name) => caches.delete(name))
				)
			)
	);
});

// Runtime HTML and precached application assets always belong to one build.
// A deployment invalidates old saved documents; the UI offers a new download.
registerRoute(
	({ request, url, sameOrigin }) =>
		sameOrigin &&
		request.mode === 'navigate' &&
		!!canonicalEntryPath(url.href, self.location.origin),
	async ({ url }) => {
		const key = canonicalEntryPath(url.href, self.location.origin)!;
		const cache = await caches.open(documents);
		try {
			const response = await fetch(
				new Request(key, { cache: 'no-store', signal: AbortSignal.timeout(4000) })
			);
			if (response.ok && documentMatchesVersion(await response.clone().text(), version))
				await cache.put(key, response.clone());
			if (response.ok) return response;
		} catch {
			/* Cached canonical document or an honest offline explanation. */
		}
		return (await cache.match(key)) ?? (await matchPrecache('/offline/')) ?? Response.error();
	}
);

registerRoute(
	({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/images/'),
	async ({ request, event }) => {
		// Explicit field albums are separate from the evictable browsing cache.
		for (const name of await caches.keys()) {
			if (!name.startsWith(savedPrefix)) continue;
			const album = await caches.open(name);
			const saved =
				(await album.match(request)) ??
				(await album.match(
					new URL(request.url).pathname.replace(/\/images\/(?:preview|full)\//, '/images/web/')
				));
			if (saved) return saved;
		}
		return new StaleWhileRevalidate({
			cacheName: 'artwork-images-v2',
			plugins: [
				new CacheableResponsePlugin({ statuses: [200] }),
				new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 30 * 86400 })
			]
		}).handle({ request, event });
	}
);
registerRoute(
	({ url, sameOrigin }) =>
		sameOrigin &&
		(url.pathname.startsWith('/_app/immutable/') || url.pathname === '/rtl-text-plugin.js'),
	new CacheFirst({
		cacheName: `map-renderer-${version}`,
		plugins: [
			new CacheableResponsePlugin({ statuses: [200] }),
			new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 86400 })
		]
	})
);
registerRoute(
	({ url }) => url.hostname === 'cartocdn.com' || url.hostname.endsWith('.cartocdn.com'),
	new CacheFirst({
		cacheName: 'carto-map-assets-v1',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 30 * 86400 })
		]
	})
);
