import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, readFilters, writeFilters, galleryMode } from './url-facets';
describe('active URL filters', () => {
	it('ignores modal and tracking state', () =>
		expect(readFilters(new URLSearchParams('photo=foo&about=1&utm_source=mail'))).toEqual(
			DEFAULT_FILTERS
		));
	it('reads legacy links while allowing explicit defaults to override them', () => {
		expect(readFilters(new URLSearchParams('filter=search')).status).toBe('search');
		expect(readFilters(new URLSearchParams('filter=residence')).type).toBe('residence');
		expect(readFilters(new URLSearchParams('filter=search&status=all')).status).toBe('all');
		expect(readFilters(new URLSearchParams('filter=Germany&country=Egypt')).country).toBe('Egypt');
	});
	it('ignores invalid status/type values and caps a query', () => {
		expect(
			readFilters(new URLSearchParams('status=invalid&type=invalid&q=' + 'x'.repeat(400)))
		).toEqual({ ...DEFAULT_FILTERS, query: 'x'.repeat(300) });
	});
	it('preserves unrelated state and clears legacy/default filters', () => {
		const result = writeFilters(
			new URLSearchParams('photo=foo&about=1&filter=Germany&country=Egypt'),
			DEFAULT_FILTERS
		);
		expect(result.toString()).toBe('photo=foo&about=1');
	});
	it('round trips combined filters', () => {
		const filters = {
			country: 'Egypt',
			status: 'search' as const,
			type: 'artwork' as const,
			query: 'two fishermen'
		};
		expect(readFilters(writeFilters(new URLSearchParams(), filters))).toEqual(filters);
	});
	it('validates gallery mode', () => {
		expect(galleryMode(new URLSearchParams('mode=photos'))).toBe('photos');
		expect(galleryMode(new URLSearchParams('mode=invalid'))).toBe('entries');
	});
});
