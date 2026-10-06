import { describe, expect, it } from 'vitest';
import { people, peopleGroups, peopleContexts } from '$lib/data/people';
import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { entryKey } from './collection';
import { filterPeople, groupPeople, sortPeople } from './people';
import { DEFAULT_FILTERS, filterArtworks, filterResidences } from './map-filter';
import { readFilters, writeFilters } from './url-facets';
import { canonicalEntryPath } from '$lib/offline/keys';

describe('document-based People records', () => {
	it('has unique profiles and valid source groups, cross-references and collection links', () => {
		expect(people).toHaveLength(31);
		expect(new Set(people.map((p) => p.slug)).size).toBe(people.length);
		const entries = [...artworks, ...residences].map(entryKey);
		for (const person of people) {
			expect(person.paragraphs.length).toBeGreaterThan(0);
			for (const group of person.groups)
				expect(peopleGroups.some((g) => g.id === group)).toBe(true);
			for (const key of person.relatedEntries) expect(entries).toContain(key);
			for (const slug of person.seeAlso) expect(people.some((p) => p.slug === slug)).toBe(true);
			expect(person.paragraphs.join(' ')).not.toMatch(
				/XXX|\[\+ photo|aunt in Heeze|total spannend/
			);
		}
		for (const context of peopleContexts)
			for (const slug of context.people) expect(people.some((p) => p.slug === slug)).toBe(true);
	});
	it('finds people mentioned within shared passages and searches diacritics and context', () => {
		const search = (query: string) =>
			filterPeople(people, { ...DEFAULT_FILTERS, query }).map((p) => p.slug);
		expect(search('Karin Haude')).toContain('frieda-adolf-haude');
		expect(search('Sohair')).toEqual(['kamal-es-sarrag']);
		expect(search('Popperl')).toEqual(['leo-poepperl']);
		expect(search('Warsaw')).toEqual(
			expect.arrayContaining(['mounir-kanaan', 'mamdouh-ammar', 'youssef-francis'])
		);
	});
	it('combines group, place and query without applying artwork status to people', () => {
		expect(
			filterPeople(people, {
				...DEFAULT_FILTERS,
				type: 'person',
				group: 'collectors',
				place: '10th of Ramadan city',
				query: 'Bishara'
			}).map((p) => p.slug)
		).toEqual(['louis-bishara', 'marie-bishara']);
		expect(filterPeople(people, { ...DEFAULT_FILTERS, group: 'selb', place: 'Paris' })).toEqual([]);
		expect(filterPeople(people, { ...DEFAULT_FILTERS, status: 'search' })).toEqual([]);
		expect(filterPeople(people, { ...DEFAULT_FILTERS, type: 'artwork' })).toEqual([]);
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

describe('People grouping', () => {
	it('lists the source groups in document order, a two-group profile under both', () => {
		const sections = groupPeople(sortPeople(people, 'group'));
		expect(sections.map((section) => section.group.id)).toEqual(peopleGroups.map((g) => g.id));
		const shant = sections.filter((section) =>
			section.members.some((person) => person.slug === 'shant-chant-avetisyan')
		);
		expect(shant.map((section) => section.group.id)).toEqual(['armenian-community', 'peers']);
		expect(sections[0].members[0].slug).toBe('saeed-sadr');
	});
	it('drops groups with no matching profile', () => {
		const selb = people.filter((person) => person.groups.includes('selb'));
		expect(groupPeople(selb).map((section) => section.group.id)).toEqual(['selb']);
	});
});
