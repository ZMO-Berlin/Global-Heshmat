import { describe, it, expect } from 'vitest';
import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { entryImages, entryKey, mediaId, coverImage } from './collection';
import { DEFAULT_FILTERS, filterArtworks, filterResidences } from './map-filter';
import { readFilters, writeFilters } from './url-facets';
import { buildGhostGeoJSON, buildRelocationGeoJSON } from './geojson';
import manifest from '$lib/data/image-manifest.json';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

describe('collection browsing', () => {
	it('entries have unique, valid media references', () => {
		for (const item of [...artworks, ...residences]) {
			const images = entryImages(item);
			expect(new Set(images.map(mediaId)).size, item.name).toBe(images.length);
			if (item.coverImage)
				expect(
					images.some(
						(image) => image.src === item.coverImage || mediaId(image) === item.coverImage
					),
					item.name
				).toBe(true);
			for (const image of images) expect(mediaId(image).trim(), item.name).not.toBe('');
		}
	});
	it('keeps artwork and residence identities separate', () => {
		expect(entryKey(artworks[2])).not.toBe(entryKey(residences[2]));
	});
	it('media identity survives album reordering', () => {
		const images = entryImages(artworks[2]);
		expect(mediaId(images[1])).toBe(
			mediaId([...images].reverse().find((img) => img.src === images[1].src)!)
		);
	});
	it('uses an explicit editorial cover without changing album order', () => {
		const item = artworks.find((a) => a.id === 5)!;
		expect(coverImage(item)?.src).toBe('Intilaqat_Misr_Ahmed_Kamel.jpg');
		expect(entryImages(item)[0].src).toBe('Intilaqat_Misr_Abbau.jpg');
	});
	it('combines country, status, kind and text without losing residence search', () => {
		const filter = {
			...DEFAULT_FILTERS,
			country: 'Egypt',
			status: 'search' as const,
			query: 'mosaic'
		};
		expect(filterArtworks(artworks, filter).length).toBeGreaterThan(0);
		expect(
			filterArtworks(artworks, filter).every((a) => a.country === 'Egypt' && a.status === 'search')
		).toBe(true);
		expect(filterResidences(residences, filter)).toHaveLength(0);
		expect(filterResidences(residences, { ...DEFAULT_FILTERS, query: 'Haude' })).toHaveLength(1);
	});
	it('round-trips combined filters and preserves unrelated parameters', () => {
		const filters = {
			country: 'Egypt',
			status: 'search' as const,
			type: 'artwork' as const,
			query: 'two fishermen'
		};
		const params = writeFilters(
			new URLSearchParams('photo=x&utm_source=mail&filter=Germany'),
			filters
		);
		expect(readFilters(params)).toEqual(filters);
		expect(params.get('photo')).toBe('x');
		expect(params.has('filter')).toBe(false);
	});
	it('keeps legacy filter links readable', () => {
		expect(readFilters(new URLSearchParams('filter=Germany')).country).toBe('Germany');
		expect(readFilters(new URLSearchParams('filter=search')).status).toBe('search');
	});
	it('excludes displacement context when its artwork is filtered out', () => {
		for (const f of ['Germany', 'search', 'residence']) {
			const selected = filterArtworks(artworks, f);
			expect(buildGhostGeoJSON(selected).features).toHaveLength(0);
			expect(buildRelocationGeoJSON(selected).features).toHaveLength(0);
		}
		expect(buildRelocationGeoJSON(filterArtworks(artworks, 'Egypt')).features).toHaveLength(1);
	});
	it('all declared media dimensions match the decoded served images', async () => {
		for (const [stem, variants] of Object.entries(manifest))
			for (const [variant, dimensions] of Object.entries(variants)) {
				const actual = await sharp(
					fileURLToPath(new URL(`../../../static/images/${variant}/${stem}.webp`, import.meta.url))
				).metadata();
				expect({ width: actual.width, height: actual.height }, stem).toEqual({
					width: dimensions.width,
					height: dimensions.height
				});
			}
	});
});
