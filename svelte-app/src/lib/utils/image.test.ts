import { describe, expect, it } from 'vitest';
import { thumbUrl, webUrl } from './image';

describe('image URL helpers', () => {
	it('maps an original to its web derivative, swapping the extension', () => {
		expect(webUrl('Agiba_1.jpg')).toBe('/images/web/Agiba_1.webp');
	});

	it('maps an original to its thumbnail derivative', () => {
		expect(thumbUrl('Agiba_1.jpg')).toBe('/images/thumb/Agiba_1.webp');
	});

	it('normalises .jpeg and .jpg to the same derivative (fixes data/disk drift)', () => {
		// Some data files say ".jpg" while the file on disk is ".jpeg"; both
		// collapse to the same WebP stem, so either spelling resolves correctly.
		expect(webUrl('Agricultural museum_2.jpeg')).toBe('/images/web/Agricultural museum_2.webp');
		expect(webUrl('Agricultural museum_2.jpg')).toBe('/images/web/Agricultural museum_2.webp');
	});

	it('handles uppercase HEIC and TIFF sources', () => {
		expect(webUrl('OFRA_Okt_74.tif')).toBe('/images/web/OFRA_Okt_74.webp');
		expect(thumbUrl('Family archive.HEIC')).toBe('/images/thumb/Family archive.webp');
	});

	it('preserves spaces and inner dots within the stem', () => {
		expect(webUrl('Gastgeschenk Heshmat 3.jpg')).toBe('/images/web/Gastgeschenk Heshmat 3.webp');
		expect(webUrl('Mosaik Officers Club Zamalek_darüber Fathy.jpeg')).toBe(
			'/images/web/Mosaik Officers Club Zamalek_darüber Fathy.webp'
		);
	});
});
