import { expect, it } from 'vitest';
import { albumAssets, albumBytes } from './client';
import { artworks } from '#lib/data/artworks.js';
import { entryImages, type Entry } from '#lib/utils/collection.js';
import { imageDimensions, thumbUrl, webUrl } from '#lib/utils/image.js';

const withImages = artworks.find((artwork) => entryImages(artwork).length > 1)!;
const entry = { ...withImages, kind: 'artwork' } as Entry;
const [first, second] = entryImages(entry);
const sized = (src: string) => imageDimensions(src, 'thumb').bytes + imageDimensions(src).bytes;

it('saves the thumbnail and web variant of every image', () => {
	const assets = albumAssets(entry);
	expect(assets).toContain(thumbUrl(first.src));
	expect(assets).toContain(webUrl(first.src));
	expect(assets).toHaveLength(new Set(entryImages(entry).map((image) => image.src)).size * 2);
	for (const asset of assets) expect(asset).toMatch(/^\/images\/(thumb|web)\//);
});
it('lists an image used twice once', () => {
	const repeated = { ...entry, images: [first, second, { ...first, caption: 'again' }] } as Entry;
	expect(albumAssets(repeated)).toEqual([
		thumbUrl(first.src),
		webUrl(first.src),
		thumbUrl(second.src),
		webUrl(second.src)
	]);
});
it('falls back to the single legacy image', () => {
	const legacy = { ...entry, images: undefined, image: first.src } as Entry;
	expect(albumAssets(legacy)).toEqual([thumbUrl(first.src), webUrl(first.src)]);
	expect(albumBytes(legacy)).toBe(sized(first.src));
});
it('is empty for an entry without images', () => {
	const bare = { ...entry, images: [], image: undefined } as Entry;
	expect(albumAssets(bare)).toEqual([]);
	expect(albumBytes(bare)).toBe(0);
});
it('estimates the download from both variants of every image', () => {
	const expected = entryImages(entry).reduce((sum, image) => sum + sized(image.src), 0);
	expect(albumBytes(entry)).toBe(expected);
	expect(albumBytes(entry)).toBeGreaterThan(0);
});
