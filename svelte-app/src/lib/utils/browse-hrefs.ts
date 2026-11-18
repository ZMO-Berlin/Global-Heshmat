import { resolve } from '$app/paths';
import type { Entry } from './collection';
import { readFilters, writeFilters, galleryMode, peopleSort, type GalleryMode } from './url-facets';
import type { CollectionFilters } from './map-filter';

/**
 * Pages an entry can be opened from and should close back to. The route
 * that sets the origin, the close link's accessible name and its target
 * all come from this one table, so they cannot disagree.
 */
export const ORIGIN_LABELS = {
	missing: 'Back to missing works',
	fieldbook: 'Back to fieldbook',
	trails: 'Back to trails',
	memoir: 'Back to memoir'
} as const;
export type Origin = keyof typeof ORIGIN_LABELS;
const ROUTE_ORIGINS: Partial<Record<string, Origin>> = {
	'/missing': 'missing',
	'/fieldbook': 'fieldbook',
	'/trails': 'trails',
	'/memoir': 'memoir'
};
export const isOrigin = (value: string | null | undefined): value is Origin =>
	!!value && Object.hasOwn(ORIGIN_LABELS, value);

export type BrowseView = 'map' | 'gallery';

/** What the href builders read from the current page. */
export interface BrowseContext {
	/** The current query (shallow-routing state or the URL). */
	params: URLSearchParams;
	routeId: string | null;
	filters: CollectionFilters;
	view: BrowseView;
}

export const isPeopleRoute = (routeId: string | null) => routeId?.startsWith('/people') ?? false;

/** URL filters plus the ones a route implies (Missing only lists searches; People only people). */
export function routeFilters(params: URLSearchParams, routeId: string | null): CollectionFilters {
	return {
		...readFilters(params),
		...(routeId === '/missing' ? { status: 'search' as const } : {}),
		...(isPeopleRoute(routeId)
			? { type: 'person' as const, country: '', status: 'all' as const }
			: {})
	};
}

export function browseView(
	params: URLSearchParams,
	routeId: string | null,
	hasSelection: boolean
): BrowseView {
	return routeId === '/' || (hasSelection && params.get('view') === 'map') ? 'map' : 'gallery';
}

export function browseContext(
	params: URLSearchParams,
	routeId: string | null,
	hasSelection: boolean
): BrowseContext {
	return {
		params,
		routeId,
		filters: routeFilters(params, routeId),
		view: browseView(params, routeId, hasSelection)
	};
}

const withQuery = (path: string, params: URLSearchParams) =>
	path + (params.size ? `?${params}` : '');
const peopleContext = (ctx: BrowseContext) =>
	isPeopleRoute(ctx.routeId) || ctx.filters.type === 'person';

function peopleParams(ctx: BrowseContext, patch: Partial<CollectionFilters> = {}) {
	const next = writeFilters(new URLSearchParams(), {
		...ctx.filters,
		country: '',
		status: 'all',
		type: 'all',
		...patch
	});
	const sort = peopleSort(ctx.params);
	if (sort !== 'name-asc') next.set('sort', sort);
	return next;
}

export function peopleHref(ctx: BrowseContext, patch: Partial<CollectionFilters> = {}) {
	return withQuery(resolve('/people'), peopleParams(ctx, patch));
}

export function personHref(ctx: BrowseContext, person: { slug: string }) {
	return withQuery(resolve('/people/[slug]', { slug: person.slug }), peopleParams(ctx));
}

export function entryHref(
	ctx: BrowseContext,
	item: Entry,
	options: { view?: BrowseView; photo?: string; origin?: Origin } = {}
) {
	const path =
		item.kind === 'artwork'
			? resolve('/artworks/[slug]', { slug: item.slug })
			: resolve('/residences/[slug]', { slug: item.slug });
	const next = writeFilters(new URLSearchParams(), ctx.filters);
	if (peopleContext(ctx)) {
		for (const key of ['type', 'group', 'place', 'q']) next.delete(key);
	}
	next.set('view', options.view ?? ctx.view);
	const mode = galleryMode(ctx.params);
	if (mode !== 'entries') next.set('mode', mode);
	if (options.photo) next.set('photo', options.photo);
	const origin = options.origin ?? ROUTE_ORIGINS[ctx.routeId ?? ''] ?? ctx.params.get('origin');
	if (isOrigin(origin)) next.set('origin', origin);
	return withQuery(path, next);
}

export function collectionHref(
	ctx: BrowseContext,
	mode: GalleryMode = galleryMode(ctx.params),
	view: BrowseView = 'gallery'
) {
	const next = writeFilters(new URLSearchParams(), ctx.filters);
	if (peopleContext(ctx)) {
		for (const key of ['type', 'group', 'place']) next.delete(key);
	}
	if (mode !== 'entries' && view !== 'map') next.set('mode', mode);
	return withQuery(resolve(view === 'map' ? '/' : '/collection'), next);
}

export function closeLabel(params: URLSearchParams) {
	const origin = params.get('origin');
	return isOrigin(origin) ? ORIGIN_LABELS[origin] : 'Back to collection';
}

export function closeHref(ctx: BrowseContext) {
	const origin = ctx.params.get('origin');
	if (origin === 'fieldbook') return resolve('/fieldbook');
	if (origin === 'trails') return resolve('/trails');
	if (origin === 'memoir') return resolve('/memoir');
	if (origin === 'missing') {
		const next = writeFilters(new URLSearchParams(), { ...ctx.filters, status: 'all' });
		return withQuery(resolve('/missing'), next);
	}
	return collectionHref(ctx, galleryMode(ctx.params), ctx.view);
}
