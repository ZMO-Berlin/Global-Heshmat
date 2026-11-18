/**
 * The People profiles that mention each collection record, carrying only
 * what a link needs. Entry pages read this instead of `#lib/data/people`,
 * which would put every profile's text into every entry page's chunk.
 *
 * people-relations.json is derived from the profiles' `relatedEntries`;
 * people-relations.test.ts fails when it is out of date and explains how to
 * regenerate it.
 */
import type { EntryKey } from './types';
import index from './people-relations.json';

export interface PersonLink {
	slug: string;
	name: string;
}

const relations: Partial<Record<string, PersonLink[]>> = index;

/** Profiles that mention the record, in source-document order. */
export function relatedPeople(key: EntryKey): PersonLink[] {
	return relations[key] ?? [];
}
