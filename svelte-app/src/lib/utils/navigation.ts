import { resolve } from '$app/paths';
import type { getBrowseStore } from '$lib/stores/browse.svelte';

export type NavId = 'map' | 'gallery' | 'list' | 'people' | 'trails' | 'memoir' | 'fieldbook';

export interface NavItem {
	id: NavId;
	/** Visible label. */
	label: string;
	/** Accessible name; contains the visible label (WCAG 2.5.3). */
	name: string;
	href: string;
	current: boolean;
}

/** Routes on which the gallery (not the map) is the view being read. */
const GALLERY_ROUTES = new Set(['/collection', '/artworks/[slug]', '/residences/[slug]']);

/**
 * The site's destinations, in one order for every breakpoint: the header
 * menu shows them all on desktop, and the tab bar shows all but List (a mode
 * of the gallery) on phones and tablets. `current` follows the route, so the
 * gallery is not marked current on Trails or the fieldbook.
 */
export function navItems(
	store: ReturnType<typeof getBrowseStore>,
	routeId: string | null
): NavItem[] {
	const gallery = store.view === 'gallery' && GALLERY_ROUTES.has(routeId ?? '');
	const list = store.mode === 'list';
	return [
		{
			id: 'map',
			label: 'Map',
			name: 'Map view',
			href: store.collectionHref('entries', 'map'),
			current: store.view === 'map'
		},
		{
			id: 'gallery',
			label: 'Gallery',
			name: 'Gallery view',
			href: store.collectionHref(list ? 'entries' : store.mode),
			current: gallery && !list
		},
		{
			id: 'list',
			label: 'List',
			name: 'List view',
			href: store.collectionHref('list'),
			current: gallery && list
		},
		{
			id: 'people',
			label: 'People',
			name: 'People',
			href: store.peopleHref(),
			current: store.peopleView
		},
		{
			id: 'trails',
			label: 'Trails',
			name: 'Trails',
			href: resolve('/trails'),
			current: routeId === '/trails'
		},
		{
			id: 'memoir',
			label: 'Memoir',
			name: 'Memoir',
			href: resolve('/memoir'),
			current: routeId === '/memoir'
		},
		{
			id: 'fieldbook',
			label: 'Fieldbook',
			name: 'Fieldbook',
			href: resolve('/fieldbook'),
			current: routeId === '/fieldbook'
		}
	];
}
