import { describe, expect, it } from 'vitest';
import {
	DEFAULT_FILTERS,
	countryFacets,
	filterArtworks,
	filterResidences,
	legacyFilter
} from './collection-filter';
import type { Artwork, Residence } from '#lib/data/types.js';

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
		expect(filterArtworks(items, DEFAULT_FILTERS).map((a) => a.id)).toEqual([1, 2, 3, 4]);
	});

	it('returns only unlocated works under the "to be found" filter', () => {
		expect(
			filterArtworks(items, { ...DEFAULT_FILTERS, status: 'search' }).map((a) => a.id)
		).toEqual([2, 4]);
	});

	it('returns no artworks under the residence filter — that view is residences only', () => {
		expect(filterArtworks(items, { ...DEFAULT_FILTERS, type: 'residence' })).toEqual([]);
	});

	it('matches the country field', () => {
		expect(
			filterArtworks(items, { ...DEFAULT_FILTERS, country: 'Egypt' }).map((a) => a.id)
		).toEqual([1, 2]);
		expect(
			filterArtworks(items, { ...DEFAULT_FILTERS, country: 'Germany' }).map((a) => a.id)
		).toEqual([3]);
	});

	it('returns an empty list for an unknown country rather than throwing', () => {
		expect(filterArtworks(items, { ...DEFAULT_FILTERS, country: 'Atlantis' })).toEqual([]);
	});

	it('does not mutate or alias the input array', () => {
		const result = filterArtworks(items, DEFAULT_FILTERS);
		expect(result).not.toBe(items);
		expect(items).toHaveLength(4);
	});
});

describe('filterResidences', () => {
	const places = [
		residence({ id: 1, name: 'Hotel Schmidt', country: 'Germany' }),
		residence({ id: 2, name: 'Leverkusen', country: 'Germany' }),
		residence({ id: 3, name: 'Ezbet En-Nakhl', city: 'Cairo', country: 'Egypt' })
	];

	it('shows residences on the default view', () => {
		expect(filterResidences(places, DEFAULT_FILTERS)).toHaveLength(3);
	});

	it('shows residences under their own category', () => {
		expect(filterResidences(places, { ...DEFAULT_FILTERS, type: 'residence' })).toHaveLength(3);
	});

	it('shows the residences of a country under that country filter', () => {
		expect(
			filterResidences(places, { ...DEFAULT_FILTERS, country: 'Germany' }).map((r) => r.id)
		).toEqual([1, 2]);
		expect(
			filterResidences(places, { ...DEFAULT_FILTERS, country: 'Egypt' }).map((r) => r.id)
		).toEqual([3]);
	});

	it('returns an empty list for a country with no residences', () => {
		expect(filterResidences(places, { ...DEFAULT_FILTERS, country: 'Sweden' })).toEqual([]);
	});

	it('hides residences under the "to be found" filter — that status is artwork-only', () => {
		expect(filterResidences(places, { ...DEFAULT_FILTERS, status: 'search' })).toEqual([]);
	});

	it('does not mutate or alias the input array', () => {
		const result = filterResidences(places, DEFAULT_FILTERS);
		expect(result).not.toBe(places);
		expect(places).toHaveLength(3);
	});
});

describe('legacyFilter', () => {
	it('decodes the single-valued filter of older links', () => {
		expect(legacyFilter('all')).toEqual(DEFAULT_FILTERS);
		expect(legacyFilter('search')).toEqual({ ...DEFAULT_FILTERS, status: 'search' });
		expect(legacyFilter('residence')).toEqual({ ...DEFAULT_FILTERS, type: 'residence' });
		expect(legacyFilter('Egypt')).toEqual({ ...DEFAULT_FILTERS, country: 'Egypt' });
	});
});

describe('countryFacets', () => {
	it('counts entries per country', () => {
		expect(countryFacets(items)).toEqual([
			{ name: 'Egypt', count: 2 },
			{ name: 'Germany', count: 1 },
			{ name: 'Sweden', count: 1 }
		]);
	});

	it('counts artworks and residences together, matching what a country filter plots', () => {
		const mixed = [...items, residence({ id: 1 }), residence({ id: 2, name: 'Leverkusen' })];
		expect(countryFacets(mixed)).toEqual([
			{ name: 'Egypt', count: 2 },
			{ name: 'Germany', count: 3 },
			{ name: 'Sweden', count: 1 }
		]);
	});

	it('lists a country reached only by a residence', () => {
		const mixed = [artwork({ id: 1, country: 'Egypt' }), residence({ id: 1, country: 'Germany' })];
		expect(countryFacets(mixed).map((c) => c.name)).toEqual(['Egypt', 'Germany']);
	});

	it('sorts alphabetically rather than by insertion (id) order', () => {
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
