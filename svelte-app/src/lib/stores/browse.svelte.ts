/* eslint-disable svelte/no-navigation-without-resolve -- All route builders use resolve(); shallow updates preserve the current resolved pathname. */
import { getContext, setContext, onMount } from 'svelte';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';
import { resolve } from '$app/paths';
import {
	entryKind,
	entryImages,
	matchesMediaId,
	type Entry,
	type Selection
} from '$lib/utils/collection';
import {
	readFilters,
	writeFilters,
	galleryMode,
	peopleSort,
	DEFAULT_FILTERS,
	type PeopleSort,
	type GalleryMode
} from '$lib/utils/url-facets';
import type { CollectionFilters } from '$lib/utils/map-filter';
import type { Person } from '$lib/data/people';
const CONTEXT = Symbol('collection-browser');
export function createBrowseStore() {
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
	const modalSession = browser ? crypto.randomUUID() : '';
	let closingModal = false;
	let browseOpen = $state(false);
	let returnKey = $state<string | null>(null);
	// SvelteKit shallow routing updates page.state, deliberately not page.url.
	// Store the query in that history entry so Back/Forward remain reactive.
	// Parse each history entry once, rather than again for every card link/getter.
	const currentParams = $derived(
		new SvelteURLSearchParams(browser ? (page.state.browseSearch ?? page.url.search) : '')
	);
	const params = () => currentParams;
	const selection = (): Selection | null =>
		page.data.artwork
			? { kind: 'artwork', item: page.data.artwork }
			: page.data.residence
				? { kind: 'residence', item: page.data.residence }
				: null;
	const filterKey = $derived(
		JSON.stringify({
			...readFilters(params()),
			...(page.route.id === '/missing' ? { status: 'search' as const } : {}),
			...(page.route.id?.startsWith('/people')
				? { type: 'person' as const, country: '', status: 'all' as const }
				: {})
		})
	);
	const filters: CollectionFilters = $derived(JSON.parse(filterKey));
	const filterParams = $derived(writeFilters(new SvelteURLSearchParams(), filters));
	function patch(patch: Record<string, string | null>, push = false) {
		const next = new SvelteURLSearchParams(params());
		for (const [key, value] of Object.entries(patch)) {
			if (value === null) next.delete(key);
			else next.set(key, value);
		}
		const target = page.url.pathname + (next.size ? `?${next}` : '') + page.url.hash;
		const state = { ...page.state, browseSearch: next.toString() };
		if (push) pushState(target, state);
		else replaceState(target, state);
	}
	function modal(key: 'photo' | 'about', value: string | null, push = false) {
		if (value === null) {
			const marker = page.state.browseModal;
			if (marker?.key === key && marker.session === modalSession) {
				if (!closingModal) {
					closingModal = true;
					window.addEventListener(
						'popstate',
						() => {
							closingModal = false;
						},
						{ once: true }
					);
					history.back();
				}
				return;
			}
		}
		if (push && value !== null && !params().has(key)) {
			patch({ [key]: value }, true);
			replaceState('', { ...page.state, browseModal: { key, session: modalSession } });
		} else patch({ [key]: value });
	}
	const store = {
		get ready() {
			return ready;
		},
		get selection() {
			return selection();
		},
		get selectedArtwork() {
			return page.data.artwork ?? null;
		},
		get selectedResidence() {
			return page.data.residence ?? null;
		},
		get filters() {
			return filters;
		},
		setFilters(value: Partial<CollectionFilters>) {
			const next = writeFilters(params(), { ...readFilters(params()), ...value });
			replaceState(page.url.pathname + (next.size ? `?${next}` : '') + page.url.hash, {
				...page.state,
				browseSearch: next.toString()
			});
		},
		resetFilters() {
			this.setFilters({ ...DEFAULT_FILTERS, group: '', place: '' });
		},
		get peopleView() {
			return page.route.id?.startsWith('/people') ?? false;
		},
		get peopleSort() {
			return peopleSort(params());
		},
		setPeopleSort(sort: PeopleSort) {
			patch({ sort: sort === 'name-asc' ? null : sort }, true);
		},
		peopleHref(patch: Partial<CollectionFilters> = {}) {
			const next = writeFilters(new SvelteURLSearchParams(), {
				...filters,
				country: '',
				status: 'all',
				type: 'all',
				...patch
			});
			if (this.peopleSort !== 'name-asc') next.set('sort', this.peopleSort);
			return resolve('/people') + (next.size ? `?${next}` : '');
		},
		personHref(person: Person) {
			const next = writeFilters(new SvelteURLSearchParams(), {
				...filters,
				country: '',
				status: 'all',
				type: 'all'
			});
			if (this.peopleSort !== 'name-asc') next.set('sort', this.peopleSort);
			return resolve('/people/[slug]', { slug: person.slug }) + (next.size ? `?${next}` : '');
		},
		searchHref() {
			return this.peopleView || filters.type === 'person'
				? this.peopleHref()
				: this.collectionHref();
		},
		get mode() {
			return galleryMode(params());
		},
		setMode(mode: GalleryMode) {
			patch({ mode: mode === 'entries' ? null : mode });
		},
		get view(): 'map' | 'gallery' {
			return page.route.id === '/' || (selection() && params().get('view') === 'map')
				? 'map'
				: 'gallery';
		},
		get photo() {
			const id = params().get('photo');
			const item = selection()?.item;
			return item && entryImages(item).some((image) => matchesMediaId(image, id)) ? id : null;
		},
		setPhoto(id: string | null, push = false) {
			modal('photo', id, push);
		},
		get aboutOpen() {
			return params().has('about');
		},
		set aboutOpen(open: boolean) {
			modal('about', open ? '1' : null, open);
		},
		get browseOpen() {
			return browseOpen;
		},
		set browseOpen(open: boolean) {
			browseOpen = open;
		},
		get returnKey() {
			return returnKey;
		},
		set returnKey(key: string | null) {
			returnKey = key;
		},
		entryHref(
			item: Entry,
			options: { view?: 'map' | 'gallery'; photo?: string; origin?: 'missing' } = {}
		) {
			const data = item;
			const path =
				entryKind(item) === 'artwork'
					? resolve('/artworks/[slug]', { slug: data.slug })
					: resolve('/residences/[slug]', { slug: data.slug });
			const next = new SvelteURLSearchParams(filterParams);
			if (this.peopleView || filters.type === 'person') {
				for (const key of ['type', 'group', 'place', 'q']) next.delete(key);
			}
			next.set('view', options.view ?? this.view);
			if (this.mode !== 'entries') next.set('mode', this.mode);
			if (options.photo) next.set('photo', options.photo);
			const origin =
				options.origin ??
				(page.route.id === '/missing'
					? 'missing'
					: page.route.id === '/fieldbook'
						? 'fieldbook'
						: page.route.id === '/trails'
							? 'trails'
							: params().get('origin'));
			if (origin && ['missing', 'fieldbook', 'trails'].includes(origin)) next.set('origin', origin);
			return path + (next.size ? `?${next}` : '');
		},
		collectionHref(mode: GalleryMode = galleryMode(params()), view: 'map' | 'gallery' = 'gallery') {
			const next = new SvelteURLSearchParams(filterParams);
			if (this.peopleView || filters.type === 'person') {
				for (const key of ['type', 'group', 'place']) next.delete(key);
			}
			if (mode !== 'entries' && view !== 'map') next.set('mode', mode);
			return resolve(view === 'map' ? '/' : '/collection') + (next.size ? `?${next}` : '');
		},
		get closeLabel() {
			const origin = params().get('origin');
			return origin === 'fieldbook'
				? 'Back to fieldbook'
				: origin === 'trails'
					? 'Back to trails'
					: 'Back to collection';
		},
		get closeHref() {
			if (params().get('origin') === 'fieldbook') return resolve('/fieldbook');
			if (params().get('origin') === 'trails') return resolve('/trails');
			if (params().get('origin') === 'missing') {
				const next = writeFilters(new SvelteURLSearchParams(), { ...this.filters, status: 'all' });
				return resolve('/missing') + (next.size ? `?${next}` : '');
			}
			return this.collectionHref(this.mode, this.view);
		}
	};
	setContext(CONTEXT, store);
	return store;
}
export function getBrowseStore(): ReturnType<typeof createBrowseStore> {
	return getContext(CONTEXT);
}
