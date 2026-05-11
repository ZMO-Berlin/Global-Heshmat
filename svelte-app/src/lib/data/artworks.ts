import allArtworks from './artworks/index';
import type { Artwork } from './types';

export const artworks = allArtworks;
export const countries = [...new Set(artworks.map((a) => a.country))];

const bySlug = new Map<string, Artwork>(artworks.map((a) => [a.slug!, a]));

/** Look up an artwork by its URL slug. Returns undefined if no match. */
export function getArtworkBySlug(slug: string): Artwork | undefined {
	return bySlug.get(slug);
}

/** All slugs, in canonical sort order — used by the prerender entries() and the sitemap. */
export const allSlugs: string[] = artworks.map((a) => a.slug!);
