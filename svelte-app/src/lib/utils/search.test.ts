import { describe, expect, it } from 'vitest';
import type { IndexedArtwork } from '$lib/data/types';
import { normalizeSearchText } from './search';
import { filterArtworks, DEFAULT_FILTERS } from './map-filter';
const searchArtworks = (items: IndexedArtwork[], query: string) =>
	filterArtworks(items, { ...DEFAULT_FILTERS, query });

function artwork(id: number, name: string, city = 'Cairo', country = 'Egypt'): IndexedArtwork {
	return {
		id,
		name,
		city,
		country,
		address: 'Museum quarter',
		lat: 30,
		lng: 31,
		status: 'located',
		desc: '',
		slug: `artwork-${id}`
	};
}

describe('artwork search', () => {
	it('folds accents and case', () => {
		expect(normalizeSearchText('  Musée ÜBER  ')).toBe('musee uber');
	});

	it('folds apostrophe variants and treats other punctuation as a word break', () => {
		expect(normalizeSearchText('Egypt’s')).toBe(normalizeSearchText("Egypt's"));
		expect(normalizeSearchText('as-Sigini')).toBe('as sigini');
		expect(normalizeSearchText('“The People’s Sculptor”, Berlin.')).toBe(
			'the peoples sculptor berlin'
		);
	});

	it('finds typographic apostrophes from a keyboard query', () => {
		const items = [artwork(1, 'Children’s Village'), artwork(2, 'Dancers')];
		expect(searchArtworks(items, "children's").map((item) => item.id)).toEqual([1]);
		expect(searchArtworks(items, 'village, cairo').map((item) => item.id)).toEqual([1]);
	});

	it('matches every query word across searchable fields', () => {
		const items = [artwork(1, 'Nile family'), artwork(2, 'Dancers', 'Selb', 'Germany')];
		expect(searchArtworks(items, 'family cairo').map((item) => item.id)).toEqual([1]);
	});

	it('matches accented archive text with an unaccented query', () => {
		const items = [artwork(1, 'Musée de l’Homme', 'Paris', 'France')];
		expect(searchArtworks(items, 'musee').map((item) => item.id)).toEqual([1]);
	});

	it('folds Arabic marks, tatweel and alef variants', () => {
		const item = { ...artwork(1, 'Museum'), aliases: ['آثار حَسَن حشمت'] };
		expect(searchArtworks([item], 'اثار حسن حـشمت')).toEqual([item]);
	});
	it('searches captions and source labels as well as aliases', () => {
		const item = {
			...artwork(1, 'Archive'),
			images: [{ src: 'a.jpg', caption: 'Installation in 1982' }],
			sources: [{ label: 'Museum catalogue' }]
		};
		expect(searchArtworks([item], '1982 catalogue')).toEqual([item]);
	});
});
