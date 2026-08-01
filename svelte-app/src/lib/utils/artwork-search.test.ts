import { describe, expect, it } from 'vitest';
import type { IndexedArtwork } from '$lib/data/types';
import { normalizeSearchText, searchArtworks } from './artwork-search';

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

	it('requires at least two characters', () => {
		expect(searchArtworks([artwork(1, 'Nile family')], 'n')).toEqual([]);
	});

	it('matches every query word across searchable fields', () => {
		const items = [artwork(1, 'Nile family'), artwork(2, 'Dancers', 'Selb', 'Germany')];
		expect(searchArtworks(items, 'family cairo').map((item) => item.id)).toEqual([1]);
	});

	it('matches accented archive text with an unaccented query', () => {
		const items = [artwork(1, 'Musée de l’Homme', 'Paris', 'France')];
		expect(searchArtworks(items, 'musee').map((item) => item.id)).toEqual([1]);
	});

	it('caps the number of results', () => {
		const items = Array.from({ length: 12 }, (_, index) => artwork(index, `Cairo work ${index}`));
		expect(searchArtworks(items, 'cairo')).toHaveLength(8);
		expect(searchArtworks(items, 'cairo', 3)).toHaveLength(3);
	});
});
