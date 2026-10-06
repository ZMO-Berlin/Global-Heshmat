const RECORD_PATH = /^\/(artworks|residences|people)\/[^/]+\/?$/;
/** A record page (artwork, residence or People profile) — the documents cached for offline use. */
export const isRecordPath = (pathname: string) => RECORD_PATH.test(pathname);
/** Shared by the window and worker: UI query parameters never identify documents. */
export function canonicalEntryPath(
	value: string,
	origin = 'https://heshmat.zmo.de'
): string | null {
	const url = new URL(value, origin);
	if (url.origin !== origin || !isRecordPath(url.pathname)) return null;
	return url.pathname.replace(/\/?$/, '/');
}
/**
 * Record HTML belongs to exactly one build: it references that build's
 * hashed JavaScript. Everything else is keyed by content, so it survives
 * deployments that don't change it.
 */
export const entryCacheName = (version: string) => `entry-pages-${version}`;
/** Content-hashed /_app/immutable/ files (map renderer, worker, RTL plugin). */
export const IMMUTABLE_CACHE = 'immutable-assets-v1';
/** Viewed images; their URLs carry a content version (?v=), so CacheFirst is safe. */
export const IMAGE_CACHE = 'artwork-images-v3';
/**
 * Albums saved explicitly in the fieldbook: their images, plus one marker per
 * album listing its page and images. Separate from the evictable caches above.
 */
export const SAVED_ALBUMS = 'saved-albums-v1';
const ALBUM_MARKER = '/offline-album/';
export const albumMarker = (key: string) => ALBUM_MARKER + key;
export const isAlbumMarker = (url: string) => new URL(url).pathname.startsWith(ALBUM_MARKER);
export interface AlbumRecord {
	/** Canonical record path, re-fetched for each new build. */
	path: string;
	assets: string[];
}
export function obsoleteCache(name: string, version: string): boolean {
	return (
		(name.startsWith('entry-pages-') && name !== entryCacheName(version)) ||
		// Retired schemes: per-build album and renderer caches, unversioned images.
		name.startsWith('saved-album-') ||
		name.startsWith('map-renderer-') ||
		name === 'artwork-images-v2'
	);
}
export function documentMatchesVersion(html: string, version: string): boolean {
	return html.includes(`name="collection-build" content="${version}"`);
}
