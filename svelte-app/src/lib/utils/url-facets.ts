import { DEFAULT_FILTERS, normalizeFilters, type CollectionFilters } from './map-filter';
export type GalleryMode = 'entries' | 'photos' | 'list';
export type PeopleSort = 'name-asc' | 'name-desc' | 'group';
export function peopleSort(params: URLSearchParams): PeopleSort {
	const sort = params.get('sort');
	return sort === 'name-desc' || sort === 'group' ? sort : 'name-asc';
}
export function readFilters(params: URLSearchParams): CollectionFilters {
	const legacy = normalizeFilters(params.get('filter') ?? 'all');
	const status = params.get('status');
	const type = params.get('type');
	return {
		country: params.get('country') ?? legacy.country,
		status:
			status === 'search' || status === 'located' || status === 'all' ? status : legacy.status,
		type:
			type === 'artwork' || type === 'residence' || type === 'person' || type === 'all'
				? type
				: legacy.type,
		query: (params.get('q') ?? '').slice(0, 300),
		...(params.get('group') ? { group: params.get('group')!.slice(0, 100) } : {}),
		...(params.get('place') ? { place: params.get('place')!.slice(0, 100) } : {})
	};
}
export function writeFilters(params: URLSearchParams, filters: CollectionFilters): URLSearchParams {
	const result = new URLSearchParams(params);
	result.delete('filter');
	for (const [key, value] of Object.entries({
		country: filters.country,
		status: filters.status === 'all' ? '' : filters.status,
		type: filters.type === 'all' ? '' : filters.type,
		q: filters.query,
		group: filters.group,
		place: filters.place
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
export { DEFAULT_FILTERS };
