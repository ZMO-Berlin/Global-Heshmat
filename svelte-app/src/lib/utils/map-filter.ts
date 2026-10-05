import type { Artwork, Residence } from '$lib/data/types';
import { normalizeSearchText } from './search';
export const FILTER_ALL = 'all';
export const FILTER_SEARCH = 'search';
export const FILTER_RESIDENCE = 'residence';
export type MapFilter = string;
export interface CollectionFilters {
	country: string;
	status: 'all' | 'located' | 'search';
	type: 'all' | 'artwork' | 'residence';
	query: string;
}
export const DEFAULT_FILTERS: CollectionFilters = {
	country: '',
	status: 'all',
	type: 'all',
	query: ''
};
export function normalizeFilters(filter: MapFilter | CollectionFilters): CollectionFilters {
	if (typeof filter !== 'string') return filter;
	return {
		...DEFAULT_FILTERS,
		...(filter === 'search'
			? { status: 'search' as const }
			: filter === 'residence'
				? { type: 'residence' as const }
				: filter !== 'all'
					? { country: filter }
					: {})
	};
}
const searchIndex = new WeakMap<Artwork | Residence, string>();
function searchableText(item: Artwork | Residence): string {
	let text = searchIndex.get(item);
	if (text === undefined) {
		text = normalizeSearchText(
			[
				item.name,
				item.displayTitle,
				item.siteName,
				item.city,
				item.district,
				item.country,
				'address' in item ? item.address : '',
				item.desc.replace(/<[^>]*>/g, ' '),
				...(item.aliases ?? []),
				...(item.images ?? []).flatMap((image) => [image.caption, image.credit]),
				...(item.sources ?? []).map((source) => source.label)
			]
				.filter(Boolean)
				.join(' ')
		);
		searchIndex.set(item, text);
	}
	return text;
}
export function matchesQuery(item: Artwork | Residence, query: string): boolean {
	const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
	return words.length === 0 || words.every((word) => searchableText(item).includes(word));
}
export function filterArtworks<T extends Artwork>(
	items: readonly T[],
	filter: MapFilter | CollectionFilters
): T[] {
	const f = normalizeFilters(filter);
	return items.filter(
		(item) =>
			f.type !== 'residence' &&
			(!f.country || item.country === f.country) &&
			(f.status === 'all' || item.status === f.status) &&
			matchesQuery(item, f.query)
	);
}
export function filterResidences<T extends Residence>(
	items: readonly T[],
	filter: MapFilter | CollectionFilters
): T[] {
	const f = normalizeFilters(filter);
	return items.filter(
		(item) =>
			f.type !== 'artwork' &&
			f.status === 'all' &&
			(!f.country || item.country === f.country) &&
			matchesQuery(item, f.query)
	);
}
export function countryFacets(
	items: readonly { country: string }[]
): { name: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const item of items) counts.set(item.country, (counts.get(item.country) ?? 0) + 1);
	return [...counts]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
