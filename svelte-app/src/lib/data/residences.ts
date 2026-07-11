import allResidences from './residences/index';
import type { IndexedResidence } from './types';

/** All places of residence, sorted by id, each with a guaranteed `slug`. */
export const residences: IndexedResidence[] = allResidences;

const bySlug = new Map<string, IndexedResidence>(residences.map((r) => [r.slug, r]));

/** Look up a place of residence by its URL slug. Returns undefined if no match. */
export function getResidenceBySlug(slug: string): IndexedResidence | undefined {
	return bySlug.get(slug);
}

/** All slugs, in canonical sort order — used by the prerender entries() and the sitemap. */
export const allResidenceSlugs: string[] = residences.map((r) => r.slug);
