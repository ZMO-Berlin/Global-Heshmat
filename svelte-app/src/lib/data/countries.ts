import { countryFacets } from '$lib/utils/map-filter';
import { artworks } from './artworks';
import { residences } from './residences';

/**
 * Country filter chips: alphabetical, each with the number of entries that
 * country's filter plots.
 *
 * Counted across artworks *and* places of residence, because a country filter
 * shows both. Lives here rather than in `artworks.ts` for exactly that reason —
 * the facet spans the two collections, so it belongs to neither.
 */
export const countries = countryFacets([...artworks, ...residences]);
