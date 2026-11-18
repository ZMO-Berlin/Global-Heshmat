import { countryFacets } from '#lib/utils/collection-filter.js';
import { entries } from './entries';

/**
 * Country filter chips: alphabetical, each with the number of entries that
 * country's filter plots.
 *
 * Counted across artworks *and* places of residence, because a country filter
 * shows both. Lives here rather than in `artworks.ts` for exactly that reason —
 * the facet spans the two collections, so it belongs to neither.
 */
export const countries = countryFacets(entries);
