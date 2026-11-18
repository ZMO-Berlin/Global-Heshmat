import { describe, expect, it } from 'vitest';
import { artworks } from './artworks.js';
import { residences } from './residences.js';
import { memoirCounts, ofType, pageLabel, mentionLabel, type MemoirEntity } from './memoir.js';
import {
	exhibitionTimeline,
	linkedRecords,
	pageCount,
	pageStart,
	profiledPeople,
	rankPeople,
	splitPlaces
} from './memoir-view.js';
import { entryKey, type Entry } from '#lib/utils/collection.js';

let next = 0;
const entity = (fields: Partial<MemoirEntity>): MemoirEntity => ({
	id: `e${next++}`,
	type: 'person',
	name: 'Name',
	nameAr: 'اسم',
	mentions: 1,
	pages: [],
	...fields
});
const names = (list: MemoirEntity[]) => list.map((e) => e.name);

describe('splitPlaces', () => {
	it('maps located cities, districts, streets and sites and lists the rest, most mentioned first', () => {
		const located = { lat: 30, lng: 31 };
		const { places, mapped, wider } = splitPlaces([
			entity({ type: 'place', name: 'Egypt', level: 'country', mentions: 9, ...located }),
			entity({ type: 'place', name: 'Cairo', level: 'city', mentions: 4, ...located }),
			entity({ type: 'place', name: 'Ain Shams', level: 'district', mentions: 4, ...located }),
			entity({ type: 'place', name: 'Nowhere', level: 'site', mentions: 2 }),
			entity({ type: 'place', name: 'Unplaced', mentions: 7 })
		]);
		expect(names(places)).toEqual(['Egypt', 'Unplaced', 'Ain Shams', 'Cairo', 'Nowhere']);
		expect(names(mapped)).toEqual(['Ain Shams', 'Cairo']);
		expect(names(wider)).toEqual(['Egypt', 'Unplaced', 'Nowhere']);
	});
});

describe('exhibitionTimeline', () => {
	it('groups by first year, puts undated ones apart and scales to whole decades', () => {
		const t = exhibitionTimeline([
			entity({ type: 'exhibition', name: 'B', years: [1964] }),
			entity({ type: 'exhibition', name: 'A', years: [1964, 1965] }),
			entity({ type: 'exhibition', name: 'C', years: [1971] }),
			entity({ type: 'exhibition', name: 'Z' }),
			entity({ type: 'exhibition', name: 'Y', years: [] })
		]);
		expect(t.years).toEqual([1964, 1971]);
		expect(t.byYear.map(({ year, items }) => [year, names(items)])).toEqual([
			[1964, ['A', 'B']],
			[1971, ['C']]
		]);
		expect(names(t.dated)).toEqual(['B', 'A', 'C']);
		expect(names(t.undated)).toEqual(['Y', 'Z']);
		expect(t.firstDecade).toBe(1960);
		expect(t.span).toBe(20);
		expect(t.decades).toEqual([1960, 1970, 1980]);
		expect(t.tallest).toBe(2);
	});

	it('closes the axis on the next decade when the last year ends one', () => {
		const t = exhibitionTimeline([entity({ type: 'exhibition', years: [1969] })]);
		expect([t.firstDecade, t.span, t.decades]).toEqual([1960, 10, [1960, 1970]]);
	});

	it('copes with no dated exhibitions', () => {
		const t = exhibitionTimeline([entity({ type: 'exhibition' })]);
		expect([t.years, t.decades, t.tallest]).toEqual([[], [], 0]);
	});
});

describe('people', () => {
	it('ranks by mentions, then name, and scales to the most named', () => {
		const { persons, mostNamed } = rankPeople([
			entity({ name: 'Bakr', mentions: 3 }),
			entity({ name: 'Adel', mentions: 3 }),
			entity({ name: 'Zaki', mentions: 8 })
		]);
		expect(names(persons)).toEqual(['Zaki', 'Adel', 'Bakr']);
		expect(mostNamed).toBe(8);
		expect(rankPeople([]).mostNamed).toBe(0);
	});

	it('pages twenty at a time', () => {
		expect([pageCount(99), pageCount(100), pageCount(101), pageCount(0)]).toEqual([5, 5, 6, 1]);
		expect([pageStart(1), pageStart(5)]).toEqual([0, 80]);
	});

	it('keeps only people with a profile record', () => {
		const profiled = profiledPeople([
			entity({ name: 'A', record: 'person:a' }),
			entity({ name: 'B', record: 'artwork:3' }),
			entity({ name: 'C' })
		]);
		expect(names(profiled)).toEqual(['A']);
	});
});

describe('linkedRecords', () => {
	const entry = (displayTitle: string) => ({ displayTitle, name: displayTitle }) as Entry;
	const entries = new Map<string, Entry>([
		['artwork:1', entry('Mermaid')],
		['artwork:2', entry('Atfih')],
		['residence:1', entry('Studio')]
	]);

	it('gathers every name per record, sums mentions and drops unknown records', () => {
		const records = linkedRecords(
			[
				entity({ type: 'artwork', name: 'The mermaid', record: 'artwork:1', mentions: 2 }),
				entity({ type: 'artwork', name: 'Atfih statue', record: 'artwork:2', mentions: 3 }),
				entity({ type: 'organisation', name: 'Missing', record: 'artwork:9', mentions: 50 }),
				entity({ type: 'place', name: 'Studio', record: 'residence:1', mentions: 3 }),
				entity({ type: 'place', name: 'Mermaid fountain', record: 'artwork:1', mentions: 1 }),
				entity({ type: 'place', name: 'No record', mentions: 40 })
			],
			entries
		);
		expect(records.map((r) => [r.key, names(r.names), r.mentions])).toEqual([
			['artwork:2', ['Atfih statue'], 3],
			['artwork:1', ['The mermaid', 'Mermaid fountain'], 3],
			['residence:1', ['Studio'], 3]
		]);
		expect(records[0].entry).toBe(entries.get('artwork:2'));
	});
});

describe('the extracted data', () => {
	it('has the counts the page states', () => {
		expect(ofType('person')).toHaveLength(memoirCounts.person);
		expect(ofType('place')).toHaveLength(memoirCounts.place);
		const { mapped, wider } = splitPlaces(ofType('place'));
		expect(mapped.length + wider.length).toBe(memoirCounts.place);
		expect(mapped.every((p) => p.lat !== undefined && p.lng !== undefined)).toBe(true);
		expect(mapped.length).toBeGreaterThan(0);
	});

	it('dates its exhibitions within a plausible span', () => {
		const t = exhibitionTimeline(ofType('exhibition'));
		expect(t.years[0]).toBeGreaterThanOrEqual(1930);
		expect(t.years.at(-1)).toBeLessThanOrEqual(2000);
		expect(t.byYear.reduce((sum, y) => sum + y.items.length, 0)).toBe(t.dated.length);
	});

	it('links only to records that exist on the site', () => {
		const entries = new Map<string, Entry>(
			[...artworks, ...residences].map((e) => [entryKey(e), e])
		);
		const records = linkedRecords(
			ofType('artwork').concat(ofType('organisation'), ofType('place')),
			entries
		);
		expect(records.length).toBeGreaterThan(0);
		for (const record of records) expect(entries.get(record.key)).toBe(record.entry);
	});
});

describe('labels', () => {
	it('writes page and mention labels', () => {
		expect(pageLabel([7])).toBe('p. 7');
		expect(pageLabel([1, 2, 3, 4, 5, 6, 7])).toBe('pp. 1, 2, 3, 4, 5 and 2 more');
		expect(mentionLabel({ mentions: 1, pages: [] })).toBe('1 mention');
		expect(mentionLabel({ mentions: 2, pages: [3, 4] })).toBe('2 mentions · pp. 3, 4');
	});
});
