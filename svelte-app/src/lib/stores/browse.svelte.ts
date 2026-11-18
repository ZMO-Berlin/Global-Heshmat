import { getContext, setContext, onMount } from 'svelte';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import { browser } from '$app/env';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { entryImages, matchesMediaId, type Entry, type Selection } from '#lib/utils/collection.js';
import {
	readFilters,
	writeFilters,
	galleryMode,
	peopleSort,
	DEFAULT_FILTERS,
	type PeopleSort,
	type GalleryMode
} from '#lib/utils/url-facets.js';
import type { CollectionFilters } from '#lib/utils/collection-filter.js';
import * as hrefs from '#lib/utils/browse-hrefs.js';
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
	// Serialised so that the derived filters object only changes when a value does.
	const filterKey = $derived(JSON.stringify(hrefs.routeFilters(params(), page.route.id)));
	const filters: CollectionFilters = $derived(JSON.parse(filterKey));
	const view = () => hrefs.browseView(params(), page.route.id, selection() !== null);
	// The view getter is lazy so links that never read it do not depend on page.data.
	const context = (): hrefs.BrowseContext => ({
		params: params(),
		routeId: page.route.id,
		filters,
		get view() {
			return view();
		}
	});
	function patch(patch: Record<string, string | null>, push = false, extra: App.PageState = {}) {
		const next = new SvelteURLSearchParams(params());
		for (const [key, value] of Object.entries(patch)) {
			if (value === null) next.delete(key);
			else next.set(key, value);
		}
		const target = page.url.pathname + (next.size ? `?${next}` : '') + page.url.hash;
		const state = { ...page.state, browseSearch: next.toString(), ...extra };
		void goto(target, { shallow: true, replace: !push, state });
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
			// One history entry: shallow updates resolve asynchronously, so a
			// follow-up replace would still see the URL from before this push.
			patch({ [key]: value }, true, { browseModal: { key, session: modalSession } });
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
			void goto(page.url.pathname + (next.size ? `?${next}` : '') + page.url.hash, {
				shallow: true,
				replace: true,
				state: { ...page.state, browseSearch: next.toString() }
			});
		},
		resetFilters() {
			this.setFilters({ ...DEFAULT_FILTERS, group: '', place: '' });
		},
		get peopleView() {
			return hrefs.isPeopleRoute(page.route.id);
		},
		get peopleSort() {
			return peopleSort(params());
		},
		setPeopleSort(sort: PeopleSort) {
			patch({ sort: sort === 'name-asc' ? null : sort }, true);
		},
		peopleHref(patch: Partial<CollectionFilters> = {}) {
			return hrefs.peopleHref(context(), patch);
		},
		/** Accepts any object with a slug, so a profile can be linked without loading it. */
		personHref(person: { slug: string }) {
			return hrefs.personHref(context(), person);
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
		get view(): hrefs.BrowseView {
			return view();
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
			options: { view?: hrefs.BrowseView; photo?: string; origin?: hrefs.Origin } = {}
		) {
			return hrefs.entryHref(context(), item, options);
		},
		collectionHref(mode?: GalleryMode, view?: hrefs.BrowseView) {
			return hrefs.collectionHref(context(), mode, view);
		},
		get closeLabel() {
			return hrefs.closeLabel(params());
		},
		get closeHref() {
			return hrefs.closeHref(context());
		}
	};
	setContext(CONTEXT, store);
	return store;
}
export function getBrowseStore(): ReturnType<typeof createBrowseStore> {
	return getContext(CONTEXT);
}
