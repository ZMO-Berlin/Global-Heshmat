import { describe, expect, it } from 'vitest';
import { navItems, type NavId } from './navigation';
import type { getBrowseStore } from '#lib/stores/browse.svelte.js';
import type { GalleryMode } from './url-facets';

type Store = ReturnType<typeof getBrowseStore>;
/** Only what navItems reads; hrefs echo their arguments so the tests can see them. */
function stub(state: { view?: 'map' | 'gallery'; mode?: GalleryMode; peopleView?: boolean }) {
	return {
		view: state.view ?? 'gallery',
		mode: state.mode ?? 'entries',
		peopleView: state.peopleView ?? false,
		collectionHref: (mode = state.mode ?? 'entries', view = 'gallery') =>
			`collection:${mode}:${view}`,
		peopleHref: () => 'people'
	} as unknown as Store;
}
const current = (items: ReturnType<typeof navItems>) =>
	items.filter((item) => item.current).map((item) => item.id);
const byId = (items: ReturnType<typeof navItems>) =>
	Object.fromEntries(items.map((item) => [item.id, item])) as Record<NavId, (typeof items)[number]>;

describe('navItems', () => {
	it('lists every destination in one order, with names containing their labels', () => {
		const items = navItems(stub({}), '/collection');
		expect(items.map((item) => item.id)).toEqual([
			'map',
			'gallery',
			'list',
			'people',
			'trails',
			'memoir',
			'fieldbook'
		]);
		for (const item of items) expect(item.name).toContain(item.label);
	});
	it('builds hrefs from the store and the route table', () => {
		const items = byId(navItems(stub({ mode: 'photos' }), '/collection'));
		expect(items.map.href).toBe('collection:entries:map');
		expect(items.gallery.href).toBe('collection:photos:gallery');
		expect(items.list.href).toBe('collection:list:gallery');
		expect(items.people.href).toBe('people');
		expect(items.trails.href).toBe('/trails');
		expect(items.memoir.href).toBe('/memoir');
		expect(items.fieldbook.href).toBe('/fieldbook');
	});
	it('sends Gallery back to entries from the list', () =>
		expect(byId(navItems(stub({ mode: 'list' }), '/collection')).gallery.href).toBe(
			'collection:entries:gallery'
		));
	it('marks the map current in the map view', () => {
		expect(current(navItems(stub({ view: 'map' }), '/'))).toEqual(['map']);
		expect(current(navItems(stub({ view: 'map' }), '/artworks/[slug]'))).toEqual(['map']);
	});
	it('marks Gallery or List on gallery routes by mode', () => {
		for (const route of ['/collection', '/artworks/[slug]', '/residences/[slug]']) {
			expect(current(navItems(stub({}), route))).toEqual(['gallery']);
			expect(current(navItems(stub({ mode: 'photos' }), route))).toEqual(['gallery']);
			expect(current(navItems(stub({ mode: 'list' }), route))).toEqual(['list']);
		}
	});
	it('does not mark the gallery on other gallery-view routes', () => {
		expect(current(navItems(stub({}), '/trails'))).toEqual(['trails']);
		expect(current(navItems(stub({}), '/fieldbook'))).toEqual(['fieldbook']);
		expect(current(navItems(stub({}), '/memoir'))).toEqual(['memoir']);
		expect(current(navItems(stub({ mode: 'list' }), '/missing'))).toEqual([]);
		expect(current(navItems(stub({}), null))).toEqual([]);
	});
	it('marks People from the store', () =>
		expect(current(navItems(stub({ peopleView: true }), '/people/[slug]'))).toEqual(['people']));
});
