// Deliberately not '$lib/data/people': these helpers serve the layout-level
// search too, which must not pull every profile into each page's bundle
// (see '$lib/data/people-lazy.svelte.ts'). Groups and shared passages are small.
import { peopleGroups } from '$lib/data/people/_groups';
import { peopleContexts } from '$lib/data/people/_contexts';
import type { PeopleContext, Person } from '$lib/data/types';
import type { CollectionFilters } from './map-filter';
import { normalizeSearchText } from './search';
import type { PeopleSort } from './url-facets';

const groupNames = new Map<string, string>(peopleGroups.map((group) => [group.id, group.name]));
export function groupName(id: string): string {
	return groupNames.get(id) ?? id;
}

/** The shared passages shown on (and searchable from) a profile. */
export function contextsFor(slug: string): PeopleContext[] {
	return peopleContexts.filter((context) => context.people.includes(slug));
}

const nameCollator = new Intl.Collator('en', { sensitivity: 'base' });
export function sortPeople(items: readonly Person[], sort: PeopleSort): Person[] {
	// Sort the displayed names without guessing surnames for shared family profiles.
	const name = (person: Person) => person.name.replace(/^(?:(?:Dr|Prof)\.\s*)+/u, '');
	return [...items].sort(
		(a, b) => nameCollator.compare(name(a), name(b)) * (sort === 'name-desc' ? -1 : 1)
	);
}

const searchIndex = new WeakMap<Person, string>();
export function filterPeople(items: readonly Person[], filters: CollectionFilters): Person[] {
	if (!['all', 'person'].includes(filters.type) || filters.status !== 'all' || filters.country)
		return [];
	const words = normalizeSearchText(filters.query).split(/\s+/).filter(Boolean);
	return items.filter((person) => {
		if (filters.group && !person.groups.some((group) => group === filters.group)) return false;
		if (filters.place && !person.places.includes(filters.place)) return false;
		let text = searchIndex.get(person);
		if (text === undefined) {
			text = normalizeSearchText(
				[
					person.name,
					...person.paragraphs,
					...person.notes,
					...person.places,
					...person.groups.map(groupName),
					...contextsFor(person.slug).flatMap((context) => context.paragraphs)
				].join(' ')
			);
			searchIndex.set(person, text);
		}
		return words.every((word) => text.includes(word));
	});
}

/** A literal source excerpt, never a generated biography or summary. */
export function personExcerpt(person: Person): string {
	const text = person.paragraphs.join(' ');
	if (text.length <= 210) return text;
	// Drop punctuation left at the cut so "Netherlands." doesn't become "Netherlands.…".
	return text.slice(0, text.lastIndexOf(' ', 210)).replace(/[\s.,;:–—-]+$/u, '') + '…';
}
