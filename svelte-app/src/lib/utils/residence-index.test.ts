import { describe, expect, it } from 'vitest';
import { buildResidenceIndex } from './residence-index';
import type { Residence } from '$lib/data/types';

const minimal = (overrides: Partial<Residence>): Residence => ({
	id: 1,
	name: 'Untitled',
	lat: 0,
	lng: 0,
	country: 'Germany',
	city: 'Selb',
	years: '1957',
	desc: '',
	...overrides
});

describe('buildResidenceIndex', () => {
	it('derives slug from name when no explicit slug is set', () => {
		const result = buildResidenceIndex([minimal({ id: 1, name: 'Haus der Familie Haude' })]);
		expect(result[0].slug).toBe('haus-der-familie-haude');
	});

	it('honours an explicit slug field over the derived one', () => {
		const result = buildResidenceIndex([
			minimal({ id: 1, name: 'Haus der Familie Haude', slug: 'pinned-url' })
		]);
		expect(result[0].slug).toBe('pinned-url');
	});

	it('sorts the output by id ascending regardless of input order', () => {
		const result = buildResidenceIndex([
			minimal({ id: 3, name: 'C' }),
			minimal({ id: 1, name: 'A' }),
			minimal({ id: 2, name: 'B' })
		]);
		expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
	});

	it('throws when two residences would resolve to the same auto-derived slug', () => {
		expect(() =>
			buildResidenceIndex([minimal({ id: 1, name: 'Selb' }), minimal({ id: 2, name: 'Selb' })])
		).toThrow(/Duplicate residence slug "selb".*id 1.*id 2/);
	});

	it('throws when an explicit slug collides with a derived one', () => {
		expect(() =>
			buildResidenceIndex([
				minimal({ id: 1, name: 'Original' }),
				minimal({ id: 2, name: 'Different', slug: 'original' })
			])
		).toThrow(/Duplicate residence slug "original"/);
	});

	it('returns an empty array for empty input without throwing', () => {
		expect(buildResidenceIndex([])).toEqual([]);
	});
});
