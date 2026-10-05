import { peopleContexts, groupName, type Person } from '$lib/data/people';
import type { CollectionFilters } from './map-filter';
import { normalizeSearchText } from './search';

const searchIndex = new WeakMap<Person, string>();
export function filterPeople(items: readonly Person[], filters: CollectionFilters): Person[] {
	if (!['all', 'person'].includes(filters.type) || filters.status !== 'all' || filters.country)
		return [];
	const words = normalizeSearchText(filters.query).split(/\s+/).filter(Boolean);
	return items.filter((person) => {
		if (filters.group && !person.groups.includes(filters.group)) return false;
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
					...peopleContexts
						.filter((context) => context.people.includes(person.slug))
						.flatMap((context) => context.paragraphs)
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
	return text.length > 210 ? text.slice(0, text.lastIndexOf(' ', 210)) + '…' : text;
}
