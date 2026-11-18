// What the Memoir page derives from the extracted names: pure functions over
// MemoirEntity lists, so they can be tested apart from the page.
import { MAPPED_LEVELS, type MemoirEntity } from './memoir.js';
import { entryTitle, type Entry } from '#lib/utils/collection.js';

export const PEOPLE_PER_PAGE = 20;

/** Most mentioned first, then by name. */
export const byMentions = (a: MemoirEntity, b: MemoirEntity) =>
	b.mentions - a.mentions || a.name.localeCompare(b.name);

/** Cities, districts, streets and sites go on the map; countries, regions and unlocated places are listed. */
export function splitPlaces(places: MemoirEntity[]) {
	const sorted = [...places].sort(byMentions);
	const mapped = sorted.filter(
		(p) => p.lat !== undefined && p.level !== undefined && MAPPED_LEVELS.has(p.level)
	);
	const onMap = new Set(mapped);
	return { places: sorted, mapped, wider: sorted.filter((p) => !onMap.has(p)) };
}

export interface ExhibitionYear {
	year: number;
	items: MemoirEntity[];
}

/**
 * Exhibitions grouped by their first year, the undated ones apart, with the
 * histogram's scale: whole decades on either side and the fullest year.
 */
export function exhibitionTimeline(exhibitions: MemoirEntity[]) {
	const byName = (a: MemoirEntity, b: MemoirEntity) => a.name.localeCompare(b.name);
	const dated = exhibitions.filter((e) => e.years?.length);
	const undated = exhibitions.filter((e) => !e.years?.length).sort(byName);
	const years = [...new Set(dated.map((e) => e.years![0]))].sort((a, b) => a - b);
	const byYear: ExhibitionYear[] = years.map((year) => ({
		year,
		items: dated.filter((e) => e.years![0] === year).sort(byName)
	}));
	const firstDecade = years.length ? Math.floor(years[0] / 10) * 10 : 0;
	const lastDecade = years.length ? Math.ceil((years.at(-1)! + 1) / 10) * 10 : 0;
	const span = lastDecade - firstDecade;
	return {
		dated,
		undated,
		years,
		byYear,
		firstDecade,
		span,
		tallest: Math.max(0, ...byYear.map((y) => y.items.length)),
		decades: years.length
			? Array.from({ length: span / 10 + 1 }, (_, i) => firstDecade + i * 10)
			: []
	};
}

/** People ranked by how often the book names them, and the top count the tally bars scale to. */
export function rankPeople(persons: MemoirEntity[]) {
	const ranked = [...persons].sort(byMentions);
	return { persons: ranked, mostNamed: ranked[0]?.mentions ?? 0 };
}

export const pageCount = (total: number, perPage = PEOPLE_PER_PAGE) =>
	Math.max(1, Math.ceil(total / perPage));

/** Index of the first item on a 1-based page. */
export const pageStart = (page: number, perPage = PEOPLE_PER_PAGE) => (page - 1) * perPage;

/** Those whose record links to a profile on the People routes. */
export function profiledPeople(persons: MemoirEntity[]) {
	return persons.filter((p) => p.record?.startsWith('person:'));
}

export interface LinkedRecord {
	key: string;
	entry: Entry;
	/** The book's names for the record, in the order given. */
	names: MemoirEntity[];
	mentions: number;
}

/**
 * Collection records the book refers to, each with every name it uses for it,
 * most mentioned first. Names whose record is not in `entries` are left out.
 */
export function linkedRecords(
	entities: MemoirEntity[],
	entries: ReadonlyMap<string, Entry>
): LinkedRecord[] {
	const linked = entities.filter((e) => e.record && entries.has(e.record));
	return [...new Set(linked.map((e) => e.record!))]
		.map((key) => {
			const names = linked.filter((e) => e.record === key);
			return {
				key,
				entry: entries.get(key)!,
				names,
				mentions: names.reduce((sum, e) => sum + e.mentions, 0)
			};
		})
		.sort(
			(a, b) => b.mentions - a.mentions || entryTitle(a.entry).localeCompare(entryTitle(b.entry))
		);
}
