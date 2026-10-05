import data from './people.json';

export interface Person {
	slug: string;
	name: string;
	groups: string[];
	places: string[];
	sourceParagraphs: number[];
	paragraphs: string[];
	relatedEntries: string[];
	seeAlso: string[];
	notes: string[];
}
export const people: Person[] = data.people;
export const peopleGroups = data.groups;
export const peopleContexts = data.contexts;
export const peoplePlaces = [...new Set(people.flatMap((person) => person.places))].sort((a, b) =>
	a.localeCompare(b, 'en')
);
export function getPersonBySlug(slug: string): Person | undefined {
	return people.find((person) => person.slug === slug);
}
export function groupName(id: string): string {
	return peopleGroups.find((group) => group.id === id)?.name ?? id;
}
