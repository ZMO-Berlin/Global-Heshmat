/**
 * The source document behind the People profiles, and its eight groups in
 * document order. Every profile's `groups` must use one of these ids — the
 * type checker flags a typo in a person file. See docs/people-source.md.
 */
import type { PeopleGroup } from '../types';

export const peopleSource = {
	file: 'Akteurs_draft.docx',
	sha256: '81df5b1335582bf243afd14ebbe203d9d90a14de8a1708c5d87bca26fe88aab2'
};

export const peopleGroups = [
	{ id: 'teachers', name: 'Teachers and Political Sponsors', sourceParagraph: 7 },
	{
		id: 'armenian-community',
		name: 'Heshmat and the Armenian-Egyptian (art) community in Cairo',
		sourceParagraph: 13
	},
	{ id: 'cairo-crossroads', name: 'Cairo International Crossroads', sourceParagraph: 19 },
	{ id: 'researchers', name: 'Researchers/Authors', sourceParagraph: 26 },
	{ id: 'collectors', name: 'Collectors and Benefactors', sourceParagraph: 29 },
	{ id: 'selb', name: 'The Selb Connection', sourceParagraph: 36 },
	{ id: 'peers', name: 'Contemporaries and Peers', sourceParagraph: 41 },
	{ id: 'art-historians', name: 'Art Historians and Gallerists', sourceParagraph: 59 }
] as const satisfies readonly PeopleGroup[];

export type PeopleGroupId = (typeof peopleGroups)[number]['id'];
