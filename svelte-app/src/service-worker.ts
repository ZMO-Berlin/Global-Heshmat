/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
	canonicalEntryPath,
	entryCacheName,
	obsoleteCache,
	documentMatchesVersion,
	isAlbumMarker,
	IMAGE_CACHE,
	IMMUTABLE_CACHE,
	SAVED_ALBUMS,
	type AlbumRecord
} from './lib/offline/keys';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};
const version = __BUILD_ID__;
const documents = entryCacheName(version);
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/.*/] });
cleanupOutdatedCaches();
void self.skipWaiting();
clientsClaim();

/**
 * A saved album's images are keyed by content and survive a deployment; only
 * its page belongs to one build. Fetch this build's copy of each saved page
 * before the previous build's documents are retired, so an album stays
 * available offline across updates. Offline now: the fieldbook offers a new
 * download, which then fetches only what changed.
 */
async function refreshSavedDocuments() {
	if (!(await caches.has(SAVED_ALBUMS))) return;
	const saved = await caches.open(SAVED_ALBUMS);
	const markers = (await saved.keys()).filter((request) => isAlbumMarker(request.url));
	if (!markers.length) return;
	const cache = await caches.open(documents);
	await Promise.all(
		markers.map(async (marker) => {
			try {
				const { path } = (await (await saved.match(marker))!.json()) as AlbumRecord;
				if (await cache.match(path)) return;
				const response = await fetch(
					new Request(path, { cache: 'no-store', signal: AbortSignal.timeout(6000) })
				);
				if (response.ok && documentMatchesVersion(await response.clone().text(), version))
					await cache.put(path, response);
			} catch {
				/* Leave it to the fieldbook's availability check. */
			}
		})
	);
}
self.addEventListener('activate', (event) => {
	event.waitUntil(
		refreshSavedDocuments()
			.catch(() => {})
			.then(() => caches.keys())
			.then((names) =>
				Promise.all(
					names.filter((name) => obsoleteCache(name, version)).map((name) => caches.delete(name))
				)
			)
	);
});

// Runtime HTML and precached application assets always belong to one build.
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

// A ?v= URL names one exact version of the file, so it never needs revalidating.
// Every image URL the app emits is versioned (scripts/verify-build.mjs checks).
const versionedImages = new CacheFirst({
	cacheName: IMAGE_CACHE,
	plugins: [
		new CacheableResponsePlugin({ statuses: [200] }),
		new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 90 * 86400 })
	]
});
registerRoute(
	({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/images/'),
	async ({ request, event, url }) => {
		// Explicitly saved albums first; offline, a larger or intermediate
		// variant falls back to the saved reading-size copy of the same image.
		if (await caches.has(SAVED_ALBUMS)) {
			const saved = await caches.open(SAVED_ALBUMS);
			const reading = url.pathname.replace(/\/images\/(?:preview|full)\//, '/images/web/');
			const match =
				(await saved.match(request)) ??
				(reading === url.pathname ? undefined : await saved.match(reading + url.search));
			if (match) return match;
		}
		return url.searchParams.has('v') ? versionedImages.handle({ request, event }) : fetch(request);
	}
);
// Content-hashed URLs: one stable cache, pruned by age and count, instead of
// a per-build cache that discarded the unchanged 1 MB map renderer on every deploy.
registerRoute(
	({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/_app/immutable/'),
	new CacheFirst({
		cacheName: IMMUTABLE_CACHE,
		plugins: [
			new CacheableResponsePlugin({ statuses: [200] }),
			new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 365 * 86400 })
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
