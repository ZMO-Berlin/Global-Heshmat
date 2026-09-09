import { DEFAULT_FILTERS, normalizeFilters, type CollectionFilters } from './map-filter';
export type GalleryMode = 'entries' | 'photos' | 'list';
export function readFilters(params: URLSearchParams): CollectionFilters {
	const legacy = normalizeFilters(params.get('filter') ?? 'all');
	const status = params.get('status');
	const type = params.get('type');
	return {
		country: params.get('country') ?? legacy.country,
		status: status === 'search' || status === 'located' ? status : legacy.status,
		type: type === 'artwork' || type === 'residence' ? type : legacy.type,
		query: (params.get('q') ?? '').slice(0, 300)
	};
}
export function writeFilters(params: URLSearchParams, filters: CollectionFilters): URLSearchParams {
	const result = new URLSearchParams(params);
	result.delete('filter');
	for (const [key, value] of Object.entries({
		country: filters.country,
		status: filters.status === 'all' ? '' : filters.status,
		type: filters.type === 'all' ? '' : filters.type,
		q: filters.query
	})) {
		if (value) result.set(key, value);
		else result.delete(key);
	}
	return result;
}
export function galleryMode(params: URLSearchParams): GalleryMode {
	const mode = params.get('mode');
	return mode === 'photos' || mode === 'list' ? mode : 'entries';
}
// Legacy URL helpers remain available for older integrations.
export interface FacetState {
	aboutOpen: boolean;
	activeFilter: string;
}
export const DEFAULT_FACETS: FacetState = { aboutOpen: false, activeFilter: 'all' };
export function paramsToFacets(params: URLSearchParams): FacetState {
	return { aboutOpen: params.has('about'), activeFilter: params.get('filter') ?? 'all' };
}
export function facetsToSearchString(facets: FacetState, base?: URLSearchParams): string {
	const params = new URLSearchParams(base);
	if (facets.aboutOpen) params.set('about', '1');
	else params.delete('about');
	if (facets.activeFilter !== 'all') params.set('filter', facets.activeFilter);
	else params.delete('filter');
	return params.size ? `?${params}` : '';
}
export { DEFAULT_FILTERS };
