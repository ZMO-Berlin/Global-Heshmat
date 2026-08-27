import allArtworks from './artworks/index';
import type { IndexedArtwork } from './types';

export const artworks: IndexedArtwork[] = allArtworks;

const bySlug = new Map<string, IndexedArtwork>(artworks.map((a) => [a.slug, a]));

/** Look up an artwork by its URL slug. Returns undefined if no match. */
export function getArtworkBySlug(slug: string): IndexedArtwork | undefined {
	return bySlug.get(slug);
}

/** All slugs, in canonical sort order — used by the prerender entries() and the sitemap. */
export const allSlugs: string[] = artworks.map((a) => a.slug);
