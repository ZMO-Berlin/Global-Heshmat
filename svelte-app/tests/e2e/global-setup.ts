import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { PeopleContext, Person } from '../../src/lib/data/types';
import { PEOPLE_SNAPSHOT, type PeopleSnapshot } from './people-data';

/**
 * Editors change People passages, names and groups directly on main, so the
 * browser tests take names, passages and counts from the data instead of
 * hard-coding today's wording. Profiles are collected by import.meta.glob:
 * load them through Vite, as scripts/verify-build.mjs does.
 */
export default async function globalSetup() {
	const vite = await createServer({
		root: fileURLToPath(new URL('../..', import.meta.url)),
		server: { middlewareMode: true },
		appType: 'custom',
		logLevel: 'error'
	});
	try {
		const data = await vite.ssrLoadModule('/src/lib/data/people.ts');
		const contextsFor = data.contextsFor as (slug: string) => PeopleContext[];
		const snapshot: PeopleSnapshot = {
			people: (data.people as Person[]).map((person) => ({
				...person,
				contexts: contextsFor(person.slug).flatMap((context) => context.paragraphs)
			})),
			groups: data.peopleGroups,
			places: data.peoplePlaces
		};
		mkdirSync(dirname(PEOPLE_SNAPSHOT), { recursive: true });
		writeFileSync(PEOPLE_SNAPSHOT, JSON.stringify(snapshot));
	} finally {
		await vite.close();
	}
}
