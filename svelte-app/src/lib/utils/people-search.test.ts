import { describe, expect, it, vi } from 'vitest';
import type { Person } from '$lib/data/types';
import { excerptParts, filterPeople, groupPeople, personExcerpt, sortPeople } from './people';
import { DEFAULT_FILTERS } from './map-filter';

// Behaviour is tested on fixtures, not on the published profiles: editors
// correct those passages directly on main, and a correction must not fail a test.
vi.mock('$lib/data/people/_contexts', () => ({
	peopleContexts: [
		{
			id: 'warsaw',
			people: ['mounir', 'mamdouh'],
			sourceParagraphs: [50],
			paragraphs: ['Both studied in Warsaw in the 1950s.']
		}
	]
}));

function person(fields: Partial<Person> & Pick<Person, 'slug' | 'name'>): Person {
	return {
		kind: 'person',
		groups: ['peers'],
		places: [],
		sourceParagraphs: [1],
		paragraphs: [`${fields.name} knew Heshmat.`],
		relatedEntries: [],
		seeAlso: [],
		notes: [],
		sources: [],
		...fields
	};
}
const fixtures = [
	person({
		slug: 'leo',
		name: 'Dr. Leo Pöpperl',
		groups: ['selb'],
		places: ['Selb'],
		paragraphs: ['A chemist at the Netzsch company.']
	}),
	person({
		slug: 'haude',
		name: 'Frieda and Adolf Haude',
		groups: ['selb'],
		places: ['Selb', 'Paris'],
		paragraphs: ['Their daughter Karin wrote letters.'],
		notes: ['A letter dated 1971.']
	}),
	person({ slug: 'mounir', name: 'Mounir Kanaan', places: ['Cairo'] }),
	person({
		slug: 'mamdouh',
		name: 'Mamdouh Ammar',
		groups: ['peers', 'teachers'],
		places: ['Cairo']
	}),
	person({
		slug: 'marie',
		name: 'Marie Bishara',
		groups: ['collectors'],
		places: ['10th of Ramadan city'],
		sources: [{ label: 'Hratch Tchilingirian, “Looking to the East”', url: 'https://example.org/' }]
	})
];
const search = (query: string, filters = {}) =>
	filterPeople(fixtures, { ...DEFAULT_FILTERS, ...filters, query }).map((p) => p.slug);

describe('People search', () => {
	it('folds accents and needs every word, whichever field it is in', () => {
		expect(search('Popperl')).toEqual(['leo']);
		expect(search('Karin Haude')).toEqual(['haude']);
		expect(search('Karin Pöpperl')).toEqual([]);
	});
	it('searches shared passages, notes, places, group names and source labels', () => {
		expect(search('Warsaw')).toEqual(['mounir', 'mamdouh']);
		expect(search('dated 1971')).toEqual(['haude']);
		expect(search('Ramadan')).toEqual(['marie']);
		expect(search('Selb Connection')).toEqual(['leo', 'haude']);
		expect(search('Tchilingirian')).toEqual(['marie']);
	});
	it('combines group, place and query without applying artwork filters to people', () => {
		expect(search('', { type: 'person', group: 'selb', place: 'Paris' })).toEqual(['haude']);
		expect(search('Haude', { group: 'selb', place: 'Selb' })).toEqual(['haude']);
		expect(search('', { group: 'collectors', place: 'Selb' })).toEqual([]);
		expect(search('', { status: 'search' })).toEqual([]);
		expect(search('', { type: 'artwork' })).toEqual([]);
		expect(search('', { country: 'Egypt' })).toEqual([]);
	});
});

describe('People excerpts', () => {
	const long = person({ slug: 'long', name: 'Long', paragraphs: ['Word. '.repeat(60).trim()] });
	it('marks a shortened excerpt so the list can link to the full passage', () => {
		expect(excerptParts(long).truncated).toBe(true);
		expect(excerptParts(long).text.length).toBeLessThanOrEqual(210);
		// The cut drops trailing punctuation: "Word." never becomes "Word.…".
		expect(excerptParts(long).text).toMatch(/Word$/);
		expect(personExcerpt(long)).toBe(excerptParts(long).text + '…');
	});
	it('shows a short passage in full, without an ellipsis', () => {
		expect(excerptParts(fixtures[0])).toEqual({
			text: 'A chemist at the Netzsch company.',
			truncated: false
		});
		expect(personExcerpt(fixtures[0])).toBe('A chemist at the Netzsch company.');
	});
});

describe('People sorting and grouping', () => {
	it('sorts by name without titles, reverses for Z–A and keeps document order for groups', () => {
		const names = (sort: Parameters<typeof sortPeople>[1]) =>
			sortPeople(fixtures, sort).map((p) => p.slug);
		expect(names('name-asc')).toEqual(['haude', 'leo', 'mamdouh', 'marie', 'mounir']);
		expect(names('name-desc')).toEqual(['mounir', 'marie', 'mamdouh', 'leo', 'haude']);
		expect(names('group')).toEqual(fixtures.map((p) => p.slug));
	});
	it('lists groups in document order, a two-group profile under both, empty groups dropped', () => {
		const sections = groupPeople(fixtures).map((section) => [
			section.group.id,
			section.members.map((p) => p.slug)
		]);
		expect(sections).toEqual([
			['teachers', ['mamdouh']],
			['collectors', ['marie']],
			['selb', ['leo', 'haude']],
			['peers', ['mounir', 'mamdouh']]
		]);
	});
});
