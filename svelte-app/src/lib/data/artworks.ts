import allArtworks from './artworks/index';
import { countryFacets } from '$lib/utils/map-filter';
import type { IndexedArtwork } from './types';

export const artworks: IndexedArtwork[] = allArtworks;

/**
 * Country filter chips: alphabetical, each with its artwork count. Sorted
 * deliberately — the raw insertion order is artwork-id order, which reads as
 * arbitrary to a visitor scanning the rail.
 */
export const countries = countryFacets(artworks);

const bySlug = new Map<string, IndexedArtwork>(artworks.map((a) => [a.slug, a]));

/** Look up an artwork by its URL slug. Returns undefined if no match. */
export function getArtworkBySlug(slug: string): IndexedArtwork | undefined {
	return bySlug.get(slug);
}

/** All slugs, in canonical sort order — used by the prerender entries() and the sitemap. */
export const allSlugs: string[] = artworks.map((a) => a.slug);
