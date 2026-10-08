/**
 * ============================================================
 *  PEOPLE PROFILE — DATA FILE TEMPLATE
 * ============================================================
 *
 *  One file per person. Copy this file and name the copy after the
 *  profile's slug:  <slug>.ts   (e.g. louis-bishara.ts → /people/louis-bishara/)
 *  The build fails if the filename and the `slug` field differ.
 *
 *  Every .ts file in this folder is auto-collected — no registration step.
 *  Files starting with "_" are not profiles:
 *    _groups.ts    the source document and its groups (add a group there first)
 *    _contexts.ts  passages shared by several people (portraitists, Warsaw…)
 *
 *  Profiles are document-based (see docs/people-source.md): copy the source
 *  wording; do not supplement biographies, dates or nationalities from
 *  elsewhere.
 *
 * ============================================================
 *  FIELD REFERENCE
 * ============================================================
 *
 *  REQUIRED
 *  slug              Lowercase words joined by hyphens. PERMANENT once
 *                    published — keep it when correcting a name.
 *  name              Display name, as in the source.
 *  groups            One or more group ids from _groups.ts. A typo is a
 *                    type error (`npm run check`).
 *  places            Places literally mentioned in the passage or its group
 *                    heading — not inferred residences. [] if none.
 *  sourceParagraphs  Zero-based paragraph indices in the source document.
 *                    Profiles are listed in this order.
 *  paragraphs        The passage(s), plain text.
 *
 *  OPTIONAL (omit when empty)
 *  relatedEntries    Collection records the passage explicitly mentions,
 *                    as 'artwork:<id>' or 'residence:<id>'. Each record then
 *                    links back to this profile.
 *  seeAlso           Slugs of profiles the passage refers to ("see above").
 *  notes             Footnotes from the source document.
 *  sources           Articles or books cited for the passage, shown under
 *                    "Sources" on the profile: { label, url?, checkedOn? }.
 *                    Keep citations out of `paragraphs` — the build rejects
 *                    "(Source: …)" in the passage text. Copy the address bar
 *                    without tracking parameters (?utm_source=chatgpt.com…):
 *                    the build rejects those too.
 *
 *  Shared passages are not repeated here: list the slug in the passage's
 *  `people` in _contexts.ts and it appears on this profile automatically.
 *
 * ============================================================
 *  FILLED EXAMPLE (copy and adapt)
 * ============================================================
 */

import type { PersonRecord } from '../types';

const person: PersonRecord = {
	slug: 'jane-example',
	name: 'Jane Example',
	groups: ['collectors'],
	places: ['Cairo'],
	sourceParagraphs: [34],
	paragraphs: ['Jane Example (1930–2000) commissioned a fountain for her garden in Cairo.'],
	relatedEntries: ['artwork:5'],
	seeAlso: ['louis-bishara'],
	notes: ['A footnote from the source document.'],
	sources: [
		{
			label: 'Author Name, “Article title”, Newspaper, 11 January 2022',
			url: 'https://www.example.org/article/'
		}
	]
};

export default person;
