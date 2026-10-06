import {
	albumMarker,
	canonicalEntryPath,
	documentMatchesVersion,
	entryCacheName,
	isAlbumMarker,
	SAVED_ALBUMS,
	type AlbumRecord
} from './keys';
import { entryImages, entryKey, entryPath, type Entry } from '$lib/utils/collection';
import { imageDimensions, thumbUrl, webUrl } from '$lib/utils/image';

export const offlineSupported = () =>
	typeof window !== 'undefined' && 'serviceWorker' in navigator && 'caches' in window;
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
/** Every image URL some other saved album still needs. */
async function assetsInUse(saved: Cache, except: string): Promise<Set<string>> {
	const markers = (await saved.keys()).filter(
		(request) => isAlbumMarker(request.url) && new URL(request.url).pathname !== except
	);
	const records = await Promise.all(
		markers.map(
			async (marker) => ((await (await saved.match(marker))?.json()) ?? null) as AlbumRecord | null
		)
	);
	return new Set(records.flatMap((record) => record?.assets ?? []));
}
/** Drop an album's images that no other saved album uses (shared images are stored once). */
async function releaseAssets(saved: Cache, marker: string, assets: string[]) {
	const inUse = await assetsInUse(saved, marker);
	await Promise.all(assets.filter((path) => !inUse.has(path)).map((path) => saved.delete(path)));
}
/**
 * Available offline: this build's copy of the page (the worker re-fetches it
 * after an update) and every current image. An image whose content changed has
 * a new ?v= URL, so it reads as missing until the album is saved again.
 */
export async function albumAvailable(entry: Entry): Promise<boolean> {
	if (!offlineSupported()) return false;
	if (!(await caches.has(entryCacheName(__BUILD_ID__)))) return false;
	const documents = await caches.open(entryCacheName(__BUILD_ID__));
	if (!(await documents.match(entryPath(entry)))) return false;
	if (!(await caches.has(SAVED_ALBUMS))) return false;
	const saved = await caches.open(SAVED_ALBUMS);
	if (!(await saved.match(albumMarker(entryKey(entry))))) return false;
	return (await Promise.all(albumAssets(entry).map((path) => saved.match(path)))).every(Boolean);
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
	const cache = await caches.open(SAVED_ALBUMS);
	const marker = albumMarker(entryKey(entry));
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
	// Images replaced since the last save are released, unless another album uses them.
	const previous = (await (await cache.match(marker))?.json()) as AlbumRecord | undefined;
	const record: AlbumRecord = { path: entryPath(entry), assets };
	await cache.put(
		marker,
		new Response(JSON.stringify(record), { headers: { 'Content-Type': 'application/json' } })
	);
	if (previous)
		await releaseAssets(
			cache,
			marker,
			previous.assets.filter((path) => !assets.includes(path))
		);
	if (!(await albumAvailable(entry)))
		throw new Error('The browser could not retain this album. Free some storage and try again.');
}
export async function removeAlbum(entry: Entry): Promise<void> {
	if (!offlineSupported() || !(await caches.has(SAVED_ALBUMS))) return;
	const saved = await caches.open(SAVED_ALBUMS);
	const marker = albumMarker(entryKey(entry));
	const record = (await (await saved.match(marker))?.json()) as AlbumRecord | undefined;
	await saved.delete(marker);
	await releaseAssets(saved, marker, [
		...new Set([...(record?.assets ?? []), ...albumAssets(entry)])
	]);
}
