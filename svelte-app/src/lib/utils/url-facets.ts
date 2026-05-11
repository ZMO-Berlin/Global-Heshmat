/**
 * Pure helpers that map between the URL query string and the "facet" state
 * the user can shape from the map view (whether the About modal is open,
 * which country/status filter is active). Kept separate from the
 * browser-side store sync so they can be unit-tested without a window.
 */

export interface FacetState {
	aboutOpen: boolean;
	activeFilter: string;
}

export const DEFAULT_FACETS: FacetState = {
	aboutOpen: false,
	activeFilter: 'all'
};

/** Parse a URL's query string into facet state. Unknown params are ignored. */
export function paramsToFacets(params: URLSearchParams): FacetState {
	return {
		aboutOpen: params.has('about'),
		activeFilter: params.get('filter') ?? DEFAULT_FACETS.activeFilter
	};
}

/**
 * Project facet state back onto a URL search string. Default values are
 * omitted so the URL stays clean. If `base` is provided, any params it
 * carries that we don't manage (e.g. UTM tags) are preserved.
 *
 * Returns a leading-`?` search string, or '' when no params are needed.
 */
export function facetsToSearchString(facets: FacetState, base?: URLSearchParams): string {
	const params = new URLSearchParams(base);

	if (facets.aboutOpen) params.set('about', '1');
	else params.delete('about');

	if (facets.activeFilter !== DEFAULT_FACETS.activeFilter) {
		params.set('filter', facets.activeFilter);
	} else {
		params.delete('filter');
	}

	const s = params.toString();
	return s ? '?' + s : '';
}
