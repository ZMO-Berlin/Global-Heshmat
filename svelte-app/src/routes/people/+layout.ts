import { peoplePlaces } from '$lib/data/people';
import type { LayoutLoad } from './$types';

// The "Place mentioned" facet lives in the site-wide filter bar, but only the
// People routes load the profiles it is derived from.
export const load: LayoutLoad = () => ({ peoplePlaces });
