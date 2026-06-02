import { describe, expect, it } from 'vitest';
import { DEFAULT_FACETS, paramsToFacets, facetsToSearchString } from './url-facets';

describe('paramsToFacets', () => {
	it('returns default state for an empty query string', () => {
		expect(paramsToFacets(new URLSearchParams(''))).toEqual(DEFAULT_FACETS);
	});

	it('treats any value of `about` as truthy (presence-only flag)', () => {
		expect(paramsToFacets(new URLSearchParams('about=1')).aboutOpen).toBe(true);
		expect(paramsToFacets(new URLSearchParams('about=')).aboutOpen).toBe(true);
		expect(paramsToFacets(new URLSearchParams('about=anything')).aboutOpen).toBe(true);
	});

	it('reads the active filter verbatim', () => {
		expect(paramsToFacets(new URLSearchParams('filter=Egypt')).activeFilter).toBe('Egypt');
		expect(paramsToFacets(new URLSearchParams('filter=search')).activeFilter).toBe('search');
	});

	it('falls back to the default filter when the param is missing', () => {
		expect(paramsToFacets(new URLSearchParams('about=1')).activeFilter).toBe('all');
	});

	it('ignores unknown params', () => {
		expect(paramsToFacets(new URLSearchParams('utm_source=email&unrelated=x'))).toEqual(
			DEFAULT_FACETS
		);
	});
});

describe('facetsToSearchString', () => {
	it('returns the empty string for the default state', () => {
		expect(facetsToSearchString(DEFAULT_FACETS)).toBe('');
	});

	it('serializes a non-default filter', () => {
		expect(facetsToSearchString({ aboutOpen: false, activeFilter: 'Egypt' })).toBe('?filter=Egypt');
	});

	it('serializes the about flag with a stable value', () => {
		expect(facetsToSearchString({ aboutOpen: true, activeFilter: 'all' })).toBe('?about=1');
	});

	it('serializes both at once in a deterministic order', () => {
		expect(facetsToSearchString({ aboutOpen: true, activeFilter: 'Egypt' })).toBe(
			'?about=1&filter=Egypt'
		);
	});

	it('preserves unrelated params in the base', () => {
		const base = new URLSearchParams('utm_source=email');
		expect(facetsToSearchString({ aboutOpen: false, activeFilter: 'Egypt' }, base)).toBe(
			'?utm_source=email&filter=Egypt'
		);
	});

	it('clears managed params from the base when state is default', () => {
		const base = new URLSearchParams('about=1&filter=Egypt&utm_source=email');
		expect(facetsToSearchString(DEFAULT_FACETS, base)).toBe('?utm_source=email');
	});

	it('round-trips through paramsToFacets', () => {
		const facets = { aboutOpen: true, activeFilter: 'France' };
		const search = facetsToSearchString(facets);
		expect(paramsToFacets(new URLSearchParams(search.slice(1)))).toEqual(facets);
	});
});
