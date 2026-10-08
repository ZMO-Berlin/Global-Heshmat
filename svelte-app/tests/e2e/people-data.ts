import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { PeopleGroupId } from '../../src/lib/data/people/_groups';
import type { PeopleContext, PeopleGroup, Person } from '../../src/lib/data/types';

/** Written by global-setup.ts before the browser tests run. */
export const PEOPLE_SNAPSHOT = fileURLToPath(
	new URL('../../.svelte-kit/e2e/people.json', import.meta.url)
);

export interface PeopleSnapshot {
	/** Profiles in source-document order, each with the shared passages shown on it. */
	people: (Person & { contexts: PeopleContext['paragraphs'] })[];
	groups: (PeopleGroup & { id: PeopleGroupId })[];
	places: string[];
}

let snapshot: PeopleSnapshot | undefined;
/** Read lazily: Playwright loads the test files before global setup has run. */
export function peopleData(): PeopleSnapshot {
	return (snapshot ??= JSON.parse(readFileSync(PEOPLE_SNAPSHOT, 'utf8')) as PeopleSnapshot);
}

export type ProfileSnapshot = PeopleSnapshot['people'][number];

/**
 * The first profile that satisfies `predicate`. If an edit leaves no such
 * profile, the calling test is skipped: editorial changes must never block a deploy.
 */
export function profileWhere(
	predicate: (person: ProfileSnapshot) => boolean,
	what: string
): ProfileSnapshot {
	const person = peopleData().people.find(predicate);
	if (person) return person;
	test.skip(true, `No People profile ${what}`);
	throw new Error('unreachable: test.skip throws');
}

/** The longest plain word of a profile's own passage that is not part of its name. */
export function passageWord(person: ProfileSnapshot): string {
	const words = person.paragraphs
		.join(' ')
		.split(/\s+/)
		.map((word) => word.replace(/^\P{L}+|\P{L}+$/gu, ''))
		.filter((word) => /^\p{L}{4,}$/u.test(word) && !person.name.includes(word));
	return words.reduce((longest, word) => (word.length > longest.length ? word : longest), '');
}

/** The opening words of a passage: enough to find it on the page, whatever it says. */
export function opening(text: string): string {
	return text.trim().split(/\s+/).slice(0, 6).join(' ');
}

export function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
