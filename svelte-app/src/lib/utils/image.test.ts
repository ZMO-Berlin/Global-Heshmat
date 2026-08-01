import { describe, expect, it } from 'vitest';
import { cardSrcSet, IMAGE_WIDTHS, fullUrl, leadImage, srcSet, thumbUrl, webUrl } from './image';

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
		expect(webUrl('Agricultural museum_2.jpeg')).toBe('/images/web/Agricultural%20museum_2.webp');
		expect(webUrl('Agricultural museum_2.jpg')).toBe('/images/web/Agricultural%20museum_2.webp');
	});

	it('handles uppercase HEIC and TIFF sources', () => {
		expect(webUrl('OFRA_Okt_74.tif')).toBe('/images/web/OFRA_Okt_74.webp');
		expect(thumbUrl('Family archive.HEIC')).toBe('/images/thumb/Family%20archive.webp');
	});

	it('percent-encodes spaces, and keeps inner dots in the stem', () => {
		expect(webUrl('Gastgeschenk Heshmat 3.jpg')).toBe(
			'/images/web/Gastgeschenk%20Heshmat%203.webp'
		);
	});

	it('percent-encodes non-ASCII characters', () => {
		// Umlauts, accents and a stray backtick all occur in originals/.
		expect(webUrl('Mosaik Officers Club Zamalek_darüber Fathy.jpeg')).toBe(
			'/images/web/Mosaik%20Officers%20Club%20Zamalek_dar%C3%BCber%20Fathy.webp'
		);
	});

	it('normalises a decomposed filename to NFC before encoding', () => {
		// "Malmö" written on macOS: o + U+0308. Encoding it as-is gives
		// %CC%88, which NFC-resolving static hosts answer 404 for.
		const decomposed = 'Tva\u030a_kvinnor_av_Hassan_Heshmat_Malmo\u0308.jpg';
		const composed = 'Två_kvinnor_av_Hassan_Heshmat_Malmö.jpg';
		expect(decomposed).not.toBe(composed);
		expect(webUrl(decomposed)).toBe(webUrl(composed));
		expect(webUrl(decomposed)).not.toContain('%CC%88');
	});

	it('maps an original to its full-size derivative', () => {
		expect(fullUrl('Agiba_1.jpg')).toBe('/images/full/Agiba_1.webp');
	});

	it('builds a srcset pairing the web and full derivatives with width descriptors', () => {
		expect(srcSet('Agiba_1.jpg')).toBe(
			'/images/web/Agiba_1.webp 1200w, /images/full/Agiba_1.webp 2000w'
		);
	});

	it('emits a srcset whose URLs contain no raw spaces', () => {
		// Regression guard. A space inside a srcset URL terminates it, so the
		// remainder is parsed as the width descriptor and the candidate is
		// discarded — silently, since `src` still works. 50 of the 139 files in
		// originals/ have spaces in their names.
		for (const candidate of srcSet('Agricultural museum_2.jpg').split(',')) {
			const [url, descriptor] = candidate.trim().split(/\s+/);
			expect(url).not.toContain(' ');
			expect(descriptor).toMatch(/^\d+w$/);
		}
	});

	it('keeps the srcset descriptors in step with the declared widths', () => {
		// Guards against the widths drifting from what the generator writes.
		const set = srcSet('x.jpg');
		expect(set).toContain(`${IMAGE_WIDTHS.web}w`);
		expect(set).toContain(`${IMAGE_WIDTHS.full}w`);
	});

	it('offers a 400px candidate for collection cards', () => {
		expect(cardSrcSet('Agiba_1.jpg')).toBe(
			'/images/thumb/Agiba_1.webp 400w, /images/web/Agiba_1.webp 1200w'
		);
	});

	it('prefers the first gallery image as the lead image', () => {
		expect(leadImage({ image: 'legacy.jpg', images: [{ src: 'gallery.jpg' }] })).toBe(
			'gallery.jpg'
		);
		expect(leadImage({ image: 'legacy.jpg' })).toBe('legacy.jpg');
		expect(leadImage({})).toBeUndefined();
	});
});
