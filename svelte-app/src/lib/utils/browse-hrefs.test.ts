import { describe, expect, it } from 'vitest';
import type { Entry } from './collection';
import {
	browseContext,
	browseView,
	closeHref,
	closeLabel,
	collectionHref,
	entryHref,
	isOrigin,
	peopleHref,
	personHref,
	routeFilters
} from './browse-hrefs';

const artwork = { kind: 'artwork', slug: 'two-fishermen' } as Entry;
const residence = { kind: 'residence', slug: 'dresden-1955' } as Entry;
const ctx = (query: string, routeId: string | null = '/collection', selected = false) =>
	browseContext(new URLSearchParams(query), routeId, selected);
const query = (href: string) => Object.fromEntries(new URL(href, 'http://x').searchParams);
const path = (href: string) => new URL(href, 'http://x').pathname;

describe('route filters', () => {
	it('reads URL filters unchanged on the collection', () =>
		expect(routeFilters(new URLSearchParams('country=Egypt&q=nile'), '/collection')).toEqual({
			country: 'Egypt',
			status: 'all',
			type: 'all',
			query: 'nile'
		}));
	it('forces searched works on Missing', () =>
		expect(routeFilters(new URLSearchParams('status=located'), '/missing').status).toBe('search'));
	it('forces people and clears country/status on People routes', () => {
		for (const route of ['/people', '/people/[slug]'])
			expect(
				routeFilters(new URLSearchParams('country=Egypt&status=search&group=x'), route)
			).toMatchObject({ type: 'person', country: '', status: 'all', group: 'x' });
	});
	it('handles a missing route id', () =>
		expect(routeFilters(new URLSearchParams('type=residence'), null).type).toBe('residence'));
});

describe('view', () => {
	it('is the map on the map route and the gallery elsewhere', () => {
		expect(browseView(new URLSearchParams(), '/', false)).toBe('map');
		expect(browseView(new URLSearchParams('view=map'), '/collection', false)).toBe('gallery');
	});
	it('follows ?view=map only when an entry is open', () => {
		expect(browseView(new URLSearchParams('view=map'), '/artworks/[slug]', true)).toBe('map');
		expect(browseView(new URLSearchParams('view=gallery'), '/artworks/[slug]', true)).toBe(
			'gallery'
		);
		expect(browseView(new URLSearchParams(), '/artworks/[slug]', true)).toBe('gallery');
	});
});

describe('entryHref', () => {
	it('links each kind to its route with the current view', () => {
		expect(entryHref(ctx(''), artwork)).toBe('/artworks/two-fishermen?view=gallery');
		expect(entryHref(ctx('', '/'), residence)).toBe('/residences/dresden-1955?view=map');
	});
	it('carries the active filters and a non-default mode', () => {
		const href = entryHref(ctx('country=Egypt&status=search&q=nile&mode=photos&about=1'), artwork);
		expect(query(href)).toEqual({
			country: 'Egypt',
			status: 'search',
			q: 'nile',
			view: 'gallery',
			mode: 'photos'
		});
	});
	it('omits the default entries mode', () =>
		expect(query(entryHref(ctx('mode=entries'), artwork))).not.toHaveProperty('mode'));
	it('lets options override view and add a photo', () =>
		expect(query(entryHref(ctx(''), artwork, { view: 'map', photo: 'p1' }))).toEqual({
			view: 'map',
			photo: 'p1'
		}));
	it('strips people-only keys from the People view', () => {
		const href = entryHref(ctx('group=sculptors&place=Cairo&q=ali', '/people'), artwork);
		expect(query(href)).toEqual({ view: 'gallery' });
	});
	it('strips people-only keys when the type filter is person', () => {
		const href = entryHref(ctx('type=person&country=Egypt&group=g&q=ali'), artwork);
		expect(query(href)).toEqual({ country: 'Egypt', view: 'gallery' });
	});
	it('sets the origin from the route, then an explicit option, then the URL', () => {
		expect(query(entryHref(ctx('', '/fieldbook'), artwork)).origin).toBe('fieldbook');
		expect(query(entryHref(ctx('', '/missing'), artwork))).toMatchObject({
			origin: 'missing',
			status: 'search'
		});
		expect(query(entryHref(ctx('', '/fieldbook'), artwork, { origin: 'memoir' })).origin).toBe(
			'memoir'
		);
		expect(query(entryHref(ctx('origin=trails', '/artworks/[slug]'), artwork)).origin).toBe(
			'trails'
		);
	});
	it('drops an unknown origin', () => {
		expect(query(entryHref(ctx('origin=evil'), artwork))).not.toHaveProperty('origin');
		expect(query(entryHref(ctx('origin=toString'), artwork))).not.toHaveProperty('origin');
	});
});

describe('collectionHref', () => {
	it('defaults to the gallery in the current mode', () => {
		expect(collectionHref(ctx(''))).toBe('/collection');
		expect(collectionHref(ctx('mode=list&country=Egypt'))).toBe(
			'/collection?country=Egypt&mode=list'
		);
	});
	it('drops the mode on the map', () =>
		expect(collectionHref(ctx('mode=list&country=Egypt'), 'list', 'map')).toBe('/?country=Egypt'));
	it('keeps the query but not people keys from People', () =>
		expect(query(collectionHref(ctx('group=g&place=p&q=ali', '/people')))).toEqual({ q: 'ali' }));
	it('ignores modal state', () =>
		expect(collectionHref(ctx('photo=x&about=1'))).toBe('/collection'));
});

describe('peopleHref and personHref', () => {
	it('keeps query, group and place but drops entry-only filters', () => {
		const c = ctx('country=Egypt&status=search&type=artwork&q=ali&group=g&place=p');
		expect(query(peopleHref(c))).toEqual({ q: 'ali', group: 'g', place: 'p' });
		expect(path(peopleHref(c))).toBe('/people');
	});
	it('applies a patch', () =>
		expect(query(peopleHref(ctx('q=ali'), { group: 'sculptors' }))).toEqual({
			q: 'ali',
			group: 'sculptors'
		}));
	it('keeps a non-default sort only', () => {
		expect(query(peopleHref(ctx('sort=group', '/people')))).toEqual({ sort: 'group' });
		expect(peopleHref(ctx('sort=name-asc', '/people'))).toBe('/people');
		expect(peopleHref(ctx('sort=bogus', '/people'))).toBe('/people');
	});
	it('links a profile from its slug alone', () => {
		expect(personHref(ctx('sort=name-desc&q=ali', '/people'), { slug: 'ali-x' })).toBe(
			'/people/ali-x?q=ali&sort=name-desc'
		);
		expect(personHref(ctx(''), { slug: 'ali-x' })).toBe('/people/ali-x');
	});
});

describe('close link', () => {
	it('labels each origin and falls back to the collection', () => {
		expect(closeLabel(new URLSearchParams('origin=missing'))).toBe('Back to missing works');
		expect(closeLabel(new URLSearchParams('origin=memoir'))).toBe('Back to memoir');
		expect(closeLabel(new URLSearchParams('origin=nope'))).toBe('Back to collection');
		expect(closeLabel(new URLSearchParams())).toBe('Back to collection');
	});
	it('returns to fieldbook, trails and memoir without filters', () => {
		expect(closeHref(ctx('origin=fieldbook&country=Egypt', '/artworks/[slug]', true))).toBe(
			'/fieldbook'
		);
		expect(closeHref(ctx('origin=trails', '/artworks/[slug]', true))).toBe('/trails');
		expect(closeHref(ctx('origin=memoir', '/artworks/[slug]', true))).toBe('/memoir');
	});
	it('returns to Missing with filters but without the implied status', () =>
		expect(
			closeHref(ctx('origin=missing&status=search&country=Egypt', '/artworks/[slug]', true))
		).toBe('/missing?country=Egypt'));
	it('otherwise returns to the collection in the current mode and view', () => {
		expect(closeHref(ctx('mode=photos&country=Egypt', '/artworks/[slug]', true))).toBe(
			'/collection?country=Egypt&mode=photos'
		);
		expect(closeHref(ctx('view=map&mode=photos&country=Egypt', '/artworks/[slug]', true))).toBe(
			'/?country=Egypt'
		);
	});
});

it('recognises only the known origins', () => {
	expect(isOrigin('trails')).toBe(true);
	for (const value of ['', null, undefined, 'hasOwnProperty', 'Trails'])
		expect(isOrigin(value)).toBe(false);
});
