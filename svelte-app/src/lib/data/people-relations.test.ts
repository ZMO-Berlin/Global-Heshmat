import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { people } from './people';
import index from './people-relations.json';
import { relatedPeople } from './people-relations';

const FILE = fileURLToPath(new URL('./people-relations.json', import.meta.url));

function derive() {
	const relations: Record<string, { slug: string; name: string }[]> = {};
	for (const person of people)
		for (const key of person.relatedEntries)
			(relations[key] ??= []).push({ slug: person.slug, name: person.name });
	return Object.fromEntries(Object.entries(relations).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

describe('people-relations.json', () => {
	it('matches the relatedEntries of the People profiles', async () => {
		const expected = derive();
		if (process.env.UPDATE_PEOPLE_RELATIONS) {
			const options = { ...(await resolveConfig(FILE)), filepath: FILE };
			writeFileSync(FILE, await format(JSON.stringify(expected), options));
			return;
		}
		expect(
			index,
			'Regenerate with: UPDATE_PEOPLE_RELATIONS=1 npx vitest run src/lib/data/people-relations.test.ts'
		).toEqual(expected);
	});

	it('lists an entry’s profiles in source-document order', () => {
		const [key] = Object.keys(index) as (keyof typeof index)[];
		expect(relatedPeople(key).map((person) => person.slug)).toEqual(
			people.filter((person) => person.relatedEntries.includes(key)).map((person) => person.slug)
		);
		expect(relatedPeople('artwork:-1')).toEqual([]);
	});
});
