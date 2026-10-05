/** Shared by the window and worker: UI query parameters never identify documents. */
export function canonicalEntryPath(
	value: string,
	origin = 'https://heshmat.zmo.de'
): string | null {
	const url = new URL(value, origin);
	if (url.origin !== origin || !/^\/(artworks|residences|people)\/[^/]+\/?$/.test(url.pathname))
		return null;
	return url.pathname.replace(/\/?$/, '/');
}
export const entryCacheName = (version: string) => `entry-pages-${version}`;
export const savedCachePrefix = (version: string) => `saved-album-${version}-`;
export function obsoleteDocumentCache(name: string, version: string): boolean {
	return (
		(name.startsWith('entry-pages-') && name !== entryCacheName(version)) ||
		(name.startsWith('saved-album-') && !name.startsWith(savedCachePrefix(version))) ||
		(name.startsWith('map-renderer-') && name !== `map-renderer-${version}`)
	);
}
export function documentMatchesVersion(html: string, version: string): boolean {
	return html.includes(`name="collection-build" content="${version}"`);
}
