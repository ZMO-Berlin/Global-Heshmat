import { expect, it } from 'vitest';
import {
	canonicalEntryPath,
	obsoleteCache,
	documentMatchesVersion,
	IMAGE_CACHE,
	IMMUTABLE_CACHE,
	SAVED_ALBUMS
} from './keys';
it('canonicalizes every entry UI state to the same document', () => {
	expect(canonicalEntryPath('/artworks/album?country=Egypt&photo=x#album')).toBe(
		'/artworks/album/'
	);
	expect(canonicalEntryPath('/artworks/album/')).toBe('/artworks/album/');
	expect(canonicalEntryPath('https://other.example/artworks/album/')).toBeNull();
	expect(canonicalEntryPath('/collection/')).toBeNull();
});
it("retires only the previous build's documents and the retired cache schemes", () => {
	expect(obsoleteCache('entry-pages-build-a', 'build-b')).toBe(true);
	expect(obsoleteCache('entry-pages-build-b', 'build-b')).toBe(false);
	// Content-keyed caches survive a deployment.
	for (const name of [SAVED_ALBUMS, IMMUTABLE_CACHE, IMAGE_CACHE, 'carto-map-assets-v1'])
		expect(obsoleteCache(name, 'build-b')).toBe(false);
	// Earlier per-build and unversioned schemes are cleared once.
	for (const name of ['saved-album-build-a-artwork:1', 'map-renderer-build-a', 'artwork-images-v2'])
		expect(obsoleteCache(name, 'build-b')).toBe(true);
});
it('does not cache HTML from another deployment or an offline fallback as a valid record', () => {
	expect(documentMatchesVersion('<meta name="collection-build" content="a">', 'b')).toBe(false);
	expect(documentMatchesVersion('<meta name="collection-build" content="b">', 'b')).toBe(true);
	expect(documentMatchesVersion('<h1>Offline</h1>', 'b')).toBe(false);
});
