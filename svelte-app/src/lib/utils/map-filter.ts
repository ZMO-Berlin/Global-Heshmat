/**
 * The filter facet shared by the chip rail, the map layers and the URL.
 *
 * Three values are special; anything else is matched against an entry's
 * `country`. Keeping the special values as named constants (rather than bare
 * strings scattered across MapView and FilterBar) means a rename is a compile
 * error instead of a silently empty map.
 */

import type { Artwork, Residence } from '$lib/data/types';

export const FILTER_ALL = 'all';
export const FILTER_SEARCH = 'search';
export const FILTER_RESIDENCE = 'residence';

/**
 * `string & {}` keeps editor autocomplete for the three special values while
 * still admitting any country name.
 */
export type MapFilter =
	| typeof FILTER_ALL
	| typeof FILTER_SEARCH
	| typeof FILTER_RESIDENCE
	| (string & NonNullable<unknown>);

/** Artworks plotted under `filter`. */
export function filterArtworks<T extends Artwork>(artworks: readonly T[], filter: MapFilter): T[] {
	if (filter === FILTER_ALL) return [...artworks];
	if (filter === FILTER_SEARCH) return artworks.filter((a) => a.status === 'search');
	// The "Places of residence" filter shows residence markers only, so no
	// artworks are plotted under it.
	if (filter === FILTER_RESIDENCE) return [];
	return artworks.filter((a) => a.country === filter);
}

/**
 * Residences plotted under `filter`. They show on the default "all" view, under
 * their own category, and — like artworks — under the country they sit in: a
 * visitor picking "Germany" expects Leverkusen and Selb alongside the
 * sculptures, not a map that hides where the sculptor actually lived. Only "to
 * be found" excludes them, that status being an artwork-only property.
 */
export function filterResidences<T extends Residence>(
	residences: readonly T[],
	filter: MapFilter
): T[] {
	if (filter === FILTER_ALL || filter === FILTER_RESIDENCE) return [...residences];
	if (filter === FILTER_SEARCH) return [];
	return residences.filter((r) => r.country === filter);
}

/**
 * Country names for the filter chips, alphabetically sorted with the count of
 * entries in each. Pass everything a country filter plots — artworks *and*
 * residences — so a chip's number matches what selecting it actually shows.
 * Sorting matters: the raw insertion order is id order, which reads as
 * arbitrary to a visitor.
 */
export function countryFacets(
	items: readonly { country: string }[]
): { name: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const item of items) counts.set(item.country, (counts.get(item.country) ?? 0) + 1);
	return [...counts]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
