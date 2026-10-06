import { describe, expect, it } from 'vitest';
import { buildIndex, buildPeopleIndex } from './build-index';
import type { Artwork, PeopleContext, PersonRecord, Residence } from '$lib/data/types';

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

const person = (overrides: Partial<PersonRecord>): PersonRecord => ({
	slug: 'jane-doe',
	name: 'Jane Doe',
	groups: ['peers'],
	places: [],
	sourceParagraphs: [1],
	paragraphs: ['Jane Doe was a sculptor.'],
	...overrides
});
/** Key records the way import.meta.glob does: by path, the file named after the slug. */
const files = (...records: PersonRecord[]) =>
	Object.fromEntries(records.map((record) => [`./${record.slug}.ts`, { default: record }]));

describe('buildPeopleIndex', () => {
	it('defaults the optional lists so consumers need no fallbacks', () => {
		const [result] = buildPeopleIndex(files(person({})), []);
		expect(result).toMatchObject({ relatedEntries: [], seeAlso: [], notes: [] });
	});

	it('orders profiles by first source paragraph, not by filename', () => {
		const result = buildPeopleIndex(
			files(
				person({ slug: 'a-late', sourceParagraphs: [40, 2] }),
				person({ slug: 'z-early', sourceParagraphs: [9] }),
				person({ slug: 'm-undocumented', sourceParagraphs: [] })
			),
			[]
		);
		expect(result.map((p) => p.slug)).toEqual(['z-early', 'a-late', 'm-undocumented']);
	});

	it('throws when a file is not named after its slug', () => {
		expect(() =>
			buildPeopleIndex({ './jane-doe.ts': { default: person({ slug: 'jane-smith' }) } }, [])
		).toThrow(/jane-doe\.ts declares slug "jane-smith"/);
	});

	it('throws on an unsafe slug or a profile without a passage', () => {
		expect(() => buildPeopleIndex(files(person({ slug: 'Jane_Doe' })), [])).toThrow(
			/Unsafe person slug/
		);
		expect(() => buildPeopleIndex(files(person({ paragraphs: [] })), [])).toThrow(/no paragraphs/);
	});

	it('throws on a seeAlso or shared passage naming an unknown profile', () => {
		expect(() => buildPeopleIndex(files(person({ seeAlso: ['nobody'] })), [])).toThrow(
			/jane-doe seeAlso refers to unknown person "nobody"/
		);
		const context: PeopleContext = {
			id: 'warsaw',
			people: ['jane-doe', 'nobody'],
			sourceParagraphs: [2],
			paragraphs: ['A shared passage.']
		};
		expect(() => buildPeopleIndex(files(person({})), [context])).toThrow(
			/Shared passage warsaw refers to unknown person "nobody"/
		);
	});
});
