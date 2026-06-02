import { describe, expect, it } from 'vitest';
import { buildArtworkIndex } from './artwork-index';
import type { Artwork } from '$lib/data/types';

const minimal = (overrides: Partial<Artwork>): Artwork => ({
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

describe('buildArtworkIndex', () => {
	it('derives slug from name when no explicit slug is set', () => {
		const result = buildArtworkIndex([minimal({ id: 1, name: 'Sphinx Avenue Relief' })]);
		expect(result[0].slug).toBe('sphinx-avenue-relief');
	});

	it('honours an explicit slug field over the derived one', () => {
		const result = buildArtworkIndex([
			minimal({ id: 1, name: 'Sphinx Avenue Relief', slug: 'pinned-url' })
		]);
		expect(result[0].slug).toBe('pinned-url');
	});

	it('sorts the output by id ascending regardless of input order', () => {
		const result = buildArtworkIndex([
			minimal({ id: 3, name: 'C' }),
			minimal({ id: 1, name: 'A' }),
			minimal({ id: 2, name: 'B' })
		]);
		expect(result.map((a) => a.id)).toEqual([1, 2, 3]);
	});

	it('throws when two artworks would resolve to the same auto-derived slug', () => {
		expect(() =>
			buildArtworkIndex([
				minimal({ id: 1, name: 'The Statue' }),
				minimal({ id: 2, name: 'The Statue' })
			])
		).toThrow(/Duplicate artwork slug "the-statue".*id 1.*id 2/);
	});

	it('throws when an explicit slug collides with a derived one', () => {
		expect(() =>
			buildArtworkIndex([
				minimal({ id: 1, name: 'Original' }),
				minimal({ id: 2, name: 'Different', slug: 'original' })
			])
		).toThrow(/Duplicate artwork slug "original"/);
	});

	it('returns an empty array for empty input without throwing', () => {
		expect(buildArtworkIndex([])).toEqual([]);
	});
});
