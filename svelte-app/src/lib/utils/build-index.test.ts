import { describe, expect, it } from 'vitest';
import { buildIndex } from './build-index';
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
	name: 'Untitled',
	lat: 0,
	lng: 0,
	country: 'Germany',
	city: 'Selb',
	years: '1957',
	desc: '',
	...overrides
});

describe('buildIndex', () => {
	it('derives slug from name when no explicit slug is set', () => {
		const result = buildIndex([artwork({ id: 1, name: 'Sphinx Avenue Relief' })], 'artwork');
		expect(result[0].slug).toBe('sphinx-avenue-relief');
	});

	it('honours an explicit slug field over the derived one', () => {
		const result = buildIndex(
			[artwork({ id: 1, name: 'Sphinx Avenue Relief', slug: 'pinned-url' })],
			'artwork'
		);
		expect(result[0].slug).toBe('pinned-url');
	});

	it('sorts the output by id ascending regardless of input order', () => {
		const result = buildIndex(
			[artwork({ id: 3, name: 'C' }), artwork({ id: 1, name: 'A' }), artwork({ id: 2, name: 'B' })],
			'artwork'
		);
		expect(result.map((a) => a.id)).toEqual([1, 2, 3]);
	});

	it('preserves every field of the source entry alongside the slug', () => {
		const [result] = buildIndex(
			[artwork({ id: 5, name: 'Relief', city: 'Alexandria' })],
			'artwork'
		);
		expect(result).toMatchObject({ id: 5, name: 'Relief', city: 'Alexandria', slug: 'relief' });
	});

	it('throws when two entries would resolve to the same auto-derived slug', () => {
		expect(() =>
			buildIndex(
				[artwork({ id: 1, name: 'The Statue' }), artwork({ id: 2, name: 'The Statue' })],
				'artwork'
			)
		).toThrow(/Duplicate artwork slug "the-statue".*id 1.*id 2/);
	});

	it('throws when an explicit slug collides with a derived one', () => {
		expect(() =>
			buildIndex(
				[
					artwork({ id: 1, name: 'Original' }),
					artwork({ id: 2, name: 'Different', slug: 'original' })
				],
				'artwork'
			)
		).toThrow(/Duplicate artwork slug "original"/);
	});

	it('throws when two entries share an id (e.g. a copied template kept its id)', () => {
		expect(() =>
			buildIndex([artwork({ id: 7, name: 'First' }), artwork({ id: 7, name: 'Second' })], 'artwork')
		).toThrow(/Duplicate artwork id 7.*"First".*"Second"/);
	});

	it('throws when a name yields an empty slug and no explicit slug is set', () => {
		expect(() => buildIndex([artwork({ id: 1, name: '···' })], 'artwork')).toThrow(
			/Artwork id 1 .* empty slug/
		);
	});

	it('accepts a non-ASCII name when an explicit slug is provided', () => {
		const result = buildIndex([artwork({ id: 1, name: '···', slug: 'pinned' })], 'artwork');
		expect(result[0].slug).toBe('pinned');
	});

	it('returns an empty array for empty input without throwing', () => {
		expect(buildIndex([], 'artwork')).toEqual([]);
	});

	it('names the collection in its error messages', () => {
		expect(() =>
			buildIndex(
				[residence({ id: 1, name: 'Selb' }), residence({ id: 2, name: 'Selb' })],
				'residence'
			)
		).toThrow(/Duplicate residence slug "selb"/);
		expect(() =>
			buildIndex(
				[residence({ id: 4, name: 'First' }), residence({ id: 4, name: 'Second' })],
				'residence'
			)
		).toThrow(/Duplicate residence id 4.*"First".*"Second"/);
		expect(() => buildIndex([residence({ id: 1, name: '···' })], 'residence')).toThrow(
			/Residence id 1 .* empty slug/
		);
	});

	it('keeps artwork and residence slug namespaces independent', () => {
		// Same slug in two separate calls is fine — they live under different
		// route prefixes, so only within-collection collisions are errors.
		expect(buildIndex([artwork({ id: 1, name: 'Selb' })], 'artwork')[0].slug).toBe('selb');
		expect(buildIndex([residence({ id: 1, name: 'Selb' })], 'residence')[0].slug).toBe('selb');
	});
});
