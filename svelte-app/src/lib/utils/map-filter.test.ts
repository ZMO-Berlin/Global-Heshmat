import { describe, expect, it } from 'vitest';
import {
	FILTER_ALL,
	FILTER_RESIDENCE,
	FILTER_SEARCH,
	countryFacets,
	filterArtworks,
	filterResidences
} from './map-filter';
import type { Artwork, Residence } from '$lib/data/types';

const artwork = (overrides: Partial<Artwork>): Artwork => ({
	id: 1,
	name: 'Untitled',
	lat: 0,
	lng: 0,
	country: 'Egypt',
	city: 'Cairo',
	status: 'located',
	address: '',
	desc: '',
	...overrides
});

const residence = (overrides: Partial<Residence>): Residence => ({
	id: 1,
	name: 'Selb',
	lat: 0,
	lng: 0,
	country: 'Germany',
	city: 'Selb',
	years: '1957',
	desc: '',
	...overrides
});

const items = [
	artwork({ id: 1, country: 'Egypt', status: 'located' }),
	artwork({ id: 2, country: 'Egypt', status: 'search' }),
	artwork({ id: 3, country: 'Germany', status: 'located' }),
	artwork({ id: 4, country: 'Sweden', status: 'search' })
];

describe('filterArtworks', () => {
	it('returns every artwork under the default "all" filter', () => {
		expect(filterArtworks(items, FILTER_ALL).map((a) => a.id)).toEqual([1, 2, 3, 4]);
	});

	it('returns only unlocated works under the "to be found" filter', () => {
		expect(filterArtworks(items, FILTER_SEARCH).map((a) => a.id)).toEqual([2, 4]);
	});

	it('returns no artworks under the residence filter — that view is residences only', () => {
		expect(filterArtworks(items, FILTER_RESIDENCE)).toEqual([]);
	});

	it('matches any other value against the country field', () => {
		expect(filterArtworks(items, 'Egypt').map((a) => a.id)).toEqual([1, 2]);
		expect(filterArtworks(items, 'Germany').map((a) => a.id)).toEqual([3]);
	});

	it('returns an empty list for an unknown country rather than throwing', () => {
		expect(filterArtworks(items, 'Atlantis')).toEqual([]);
	});

	it('does not mutate or alias the input array', () => {
		const result = filterArtworks(items, FILTER_ALL);
		expect(result).not.toBe(items);
		expect(items).toHaveLength(4);
	});
});

describe('filterResidences', () => {
	const places = [residence({ id: 1 }), residence({ id: 2, name: 'Leverkusen' })];

	it('shows residences on the default view', () => {
		expect(filterResidences(places, FILTER_ALL)).toHaveLength(2);
	});

	it('shows residences under their own category', () => {
		expect(filterResidences(places, FILTER_RESIDENCE)).toHaveLength(2);
	});

	it('hides residences under a country filter — those are artwork-only', () => {
		expect(filterResidences(places, 'Germany')).toEqual([]);
	});

	it('hides residences under the "to be found" filter', () => {
		expect(filterResidences(places, FILTER_SEARCH)).toEqual([]);
	});
});

describe('countryFacets', () => {
	it('counts artworks per country', () => {
		expect(countryFacets(items)).toEqual([
			{ name: 'Egypt', count: 2 },
			{ name: 'Germany', count: 1 },
			{ name: 'Sweden', count: 1 }
		]);
	});

	it('sorts alphabetically rather than by insertion (artwork-id) order', () => {
		const scrambled = [
			artwork({ id: 1, country: 'Sweden' }),
			artwork({ id: 2, country: 'Belgium' }),
			artwork({ id: 3, country: 'Egypt' })
		];
		expect(countryFacets(scrambled).map((c) => c.name)).toEqual(['Belgium', 'Egypt', 'Sweden']);
	});

	it('returns an empty list for an empty collection', () => {
		expect(countryFacets([])).toEqual([]);
	});
});
