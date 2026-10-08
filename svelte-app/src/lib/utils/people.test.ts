import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { people, peopleGroups, peopleContexts } from '$lib/data/people';
import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { entryKey } from './collection';
import { DEFAULT_FILTERS, filterArtworks, filterResidences } from './map-filter';
import { readFilters, writeFilters } from './url-facets';
import { canonicalEntryPath } from '$lib/offline/keys';

// Integrity checks on the published profiles. Search, sorting, grouping and
// excerpts are tested on fixtures in people-search.test.ts, so that an editor's
// correction to a passage never fails a test.
describe('document-based People records', () => {
	it('publishes every profile file exactly once', () => {
		const files = readdirSync(new URL('../data/people/', import.meta.url))
			.filter((file) => file.endsWith('.ts') && !file.startsWith('_') && file !== 'index.ts')
			.map((file) => file.replace(/\.ts$/, ''));
		expect(people.map((p) => p.slug).sort()).toEqual(files.sort());
	});
	it('has valid source groups, cross-references and collection links', () => {
		const entries = [...artworks, ...residences].map(entryKey);
		for (const person of people) {
			expect(person.paragraphs.length).toBeGreaterThan(0);
			for (const group of person.groups)
				expect(peopleGroups.some((g) => g.id === group)).toBe(true);
			for (const key of person.relatedEntries) expect(entries).toContain(key);
			for (const slug of person.seeAlso) expect(people.some((p) => p.slug === slug)).toBe(true);
		}
		for (const context of peopleContexts)
			for (const slug of context.people) expect(people.some((p) => p.slug === slug)).toBe(true);
	});
	it('leaves no drafting placeholders or editor comments in the passages', () => {
		for (const person of people)
			expect(person.paragraphs.join(' ')).not.toMatch(
				/XXX|\[\+ photo|aunt in Heeze|total spannend/
			);
	});
	it('keeps artwork and residence filters away from people', () => {
		expect(filterArtworks(artworks, { ...DEFAULT_FILTERS, type: 'person' })).toEqual([]);
		expect(filterResidences(residences, { ...DEFAULT_FILTERS, type: 'person' })).toEqual([]);
	});
	it('round-trips shareable facets and removes them on clear', () => {
		const filters = {
			...DEFAULT_FILTERS,
			type: 'person' as const,
			group: 'selb',
			place: 'Selb',
			query: 'Haude'
		};
		const params = writeFilters(new URLSearchParams(), filters);
		expect(readFilters(params)).toEqual(filters);
		expect(writeFilters(params, DEFAULT_FILTERS).toString()).toBe('');
	});
	it('caches a canonical profile document regardless of its search query', () => {
		expect(
			canonicalEntryPath(
				'https://heshmat.zmo.de/people/louis-bishara/?q=Bishara',
				'https://heshmat.zmo.de'
			)
		).toBe('/people/louis-bishara/');
	});
});
