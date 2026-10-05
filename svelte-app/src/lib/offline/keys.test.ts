import { expect, it } from 'vitest';
import { canonicalEntryPath, obsoleteDocumentCache, documentMatchesVersion } from './keys';
it('canonicalizes every entry UI state to the same document', () => {
	expect(canonicalEntryPath('/artworks/album?country=Egypt&photo=x#album')).toBe(
		'/artworks/album/'
	);
	expect(canonicalEntryPath('/artworks/album/')).toBe('/artworks/album/');
	expect(canonicalEntryPath('https://other.example/artworks/album/')).toBeNull();
	expect(canonicalEntryPath('/collection/')).toBeNull();
});
it('retires old document and saved album caches without deleting unrelated caches', () => {
	expect(obsoleteDocumentCache('entry-pages-v1', 'build-b')).toBe(true);
	expect(obsoleteDocumentCache('saved-album-build-a-artwork:1', 'build-b')).toBe(true);
	expect(obsoleteDocumentCache('saved-album-build-b-artwork:1', 'build-b')).toBe(false);
	expect(obsoleteDocumentCache('map-renderer-v2', 'build-b')).toBe(true);
	expect(obsoleteDocumentCache('artwork-images-v2', 'build-b')).toBe(false);
});
it('does not cache HTML from another deployment or an offline fallback as a valid record', () => {
	expect(documentMatchesVersion('<meta name="collection-build" content="a">', 'b')).toBe(false);
	expect(documentMatchesVersion('<meta name="collection-build" content="b">', 'b')).toBe(true);
	expect(documentMatchesVersion('<h1>Offline</h1>', 'b')).toBe(false);
});
