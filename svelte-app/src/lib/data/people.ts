import allPeople from './people/index';
import type { Person } from './types';

// Re-exported so the People routes (and scripts/verify-build.mjs) have one entry point.
export { peopleGroups } from './people/_groups';
export { peopleContexts } from './people/_contexts';
export { contextsFor, groupName } from '$lib/utils/people';

/**
 * All People profiles in source-document order, each with every list present.
 * Importing this module bundles every profile: the layout-level search uses
 * `$lib/data/people-lazy.svelte.ts` instead.
 */
export const people: Person[] = allPeople;

const bySlug = new Map<string, Person>(people.map((person) => [person.slug, person]));

/** Every place mentioned in a profile, alphabetically — the "Place mentioned" facet. */
export const peoplePlaces = [...new Set(people.flatMap((person) => person.places))].sort((a, b) =>
	a.localeCompare(b, 'en')
);

export function getPersonBySlug(slug: string): Person | undefined {
	return bySlug.get(slug);
}
