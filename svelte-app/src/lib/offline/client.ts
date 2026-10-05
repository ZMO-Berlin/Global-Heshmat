import {
	canonicalEntryPath,
	documentMatchesVersion,
	entryCacheName,
	savedCachePrefix
} from './keys';
import { entryImages, entryKey, type Entry } from '$lib/utils/collection';
import { imageDimensions, thumbUrl, webUrl } from '$lib/utils/image';

export const offlineSupported = () =>
	typeof window !== 'undefined' && 'serviceWorker' in navigator && 'caches' in window;
export const entryPath = (entry: Entry) =>
	`/${'status' in entry ? 'artworks' : 'residences'}/${entry.slug}/`;
const albumCache = (entry: Entry) => savedCachePrefix(__BUILD_ID__) + entryKey(entry);
export function albumAssets(entry: Entry): string[] {
	return [
		...new Set(entryImages(entry).flatMap((image) => [thumbUrl(image.src), webUrl(image.src)]))
	];
}
export function albumBytes(entry: Entry): number {
	return entryImages(entry).reduce(
		(sum, image) =>
			sum + imageDimensions(image.src, 'thumb').bytes + imageDimensions(image.src).bytes,
		0
	);
}
export async function cacheEntryDocument(path: string): Promise<boolean> {
	if (!offlineSupported()) return false;
	const canonical = canonicalEntryPath(path, location.origin);
	if (!canonical) return false;
	const name = entryCacheName(__BUILD_ID__);
	if (await caches.has(name)) {
		if (await (await caches.open(name)).match(canonical)) return true;
	}
	const response = await fetch(canonical, {
		cache: 'no-store',
		signal: AbortSignal.timeout(20000)
	});
	if (!response.ok || !documentMatchesVersion(await response.clone().text(), __BUILD_ID__))
		return false;
	await (await caches.open(name)).put(canonical, response);
	return true;
}
export async function albumAvailable(entry: Entry): Promise<boolean> {
	if (!offlineSupported()) return false;
	if (!(await caches.has(entryCacheName(__BUILD_ID__)))) return false;
	const documents = await caches.open(entryCacheName(__BUILD_ID__));
	if (!(await documents.match(entryPath(entry)))) return false;
	if (!(await caches.has(albumCache(entry)))) return false;
	const cache = await caches.open(albumCache(entry));
	if (!(await cache.match('/offline-album-complete'))) return false;
	return (await Promise.all(albumAssets(entry).map((path) => cache.match(path)))).every(Boolean);
}
export async function saveAlbum(
	entry: Entry,
	onProgress: (completed: number, total: number) => void
): Promise<void> {
	if (!offlineSupported()) throw new Error('Offline saving is unavailable in this browser.');
	// Register immediately when explicitly requested, instead of waiting for idle registration.
	const { registerSW } = await import('virtual:pwa-register');
	registerSW({ immediate: true });
	let timeout: ReturnType<typeof setTimeout> | undefined;
	try {
		await Promise.race([
			navigator.serviceWorker.ready,
			new Promise((_, reject) => {
				timeout = setTimeout(
					() => reject(new Error('Offline setup timed out. Reconnect and try again.')),
					20000
				);
			})
		]);
	} finally {
		clearTimeout(timeout);
	}

	if (!(await cacheEntryDocument(entryPath(entry))))
		throw new Error('This collection has been updated. Reload before saving.');
	const cache = await caches.open(albumCache(entry));
	const assets = albumAssets(entry);
	let completed = 0;
	onProgress(completed, assets.length);
	// Limit concurrent downloads on mobile connections. Partial downloads can be resumed.
	const queue = [...assets];
	const downloads = await Promise.allSettled(
		Array.from({ length: Math.min(3, queue.length) }, async () => {
			for (let path = queue.shift(); path; path = queue.shift()) {
				if (!(await cache.match(path))) {
					const response = await fetch(path, { signal: AbortSignal.timeout(20000) });
					if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
						throw new Error('An image could not be saved. Reconnect and try again.');
					await cache.put(path, response);
				}
				onProgress(++completed, assets.length);
			}
		})
	);
	const failed = downloads.find((result) => result.status === 'rejected');
	if (failed?.status === 'rejected') throw failed.reason;
	await cache.put('/offline-album-complete', new Response('complete'));
	if (!(await albumAvailable(entry)))
		throw new Error('The browser could not retain this album. Free some storage and try again.');
}
export async function removeAlbum(entry: Entry): Promise<void> {
	if (!offlineSupported()) return;
	await caches.delete(albumCache(entry));
}
