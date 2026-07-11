import { browser } from '$app/environment';
import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { getMapStore } from './map.svelte';
import { facetsToSearchString, paramsToFacets } from '$lib/utils/url-facets';

/**
 * Bidirectional sync between the shared map store (About modal, active
 * filter) and the URL query string.
 *
 * Direction store → URL: a `$effect` watches the store fields plus the
 *   route's `page.url`, then `pushState` (when opening About — so Back
 *   closes it) or `replaceState` (everything else — so we don't pollute
 *   history with filter chatter) writes the new URL.
 *
 * Direction URL → store: the initial URL is parsed at setup time, and a
 *   `popstate` listener re-syncs whenever the user uses Back/Forward.
 *
 * Call once from the layout's <script> setup so the `$effect`s are owned
 * by the layout component's lifecycle (which also removes the popstate
 * listener again if the layout is ever torn down, e.g. during HMR).
 */
export function setupUrlSync(): void {
	if (!browser) return;

	const store = getMapStore();

	// Local (not module-level) so a re-setup can't inherit stale state.
	let lastAboutOpen: boolean;

	applyUrlToStore(store);
	lastAboutOpen = store.aboutOpen;

	$effect(() => {
		const onPopstate = () => {
			applyUrlToStore(store);
			lastAboutOpen = store.aboutOpen;
		};
		window.addEventListener('popstate', onPopstate);
		return () => window.removeEventListener('popstate', onPopstate);
	});

	$effect(() => {
		// Reactive deps: route changes (goto) AND local store changes both
		// retrigger this effect, so the URL stays in sync with both.
		const path = page.url.pathname;
		const facets = {
			aboutOpen: store.aboutOpen,
			activeFilter: store.activeFilter
		};

		const search = facetsToSearchString(facets, page.url.searchParams);
		const target = path + search;
		const current = window.location.pathname + window.location.search;
		if (target === current) return;

		const isOpening = facets.aboutOpen && !lastAboutOpen;
		lastAboutOpen = facets.aboutOpen;

		// `resolve()` is route-id-typed and rejects dynamic strings; the
		// target is already a fully-resolved pathname taken from `page.url`
		// (so the base path is already applied), so the rule's safety net
		// doesn't apply here.
		if (isOpening) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			pushState(target, {});
		} else {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			replaceState(target, {});
		}
	});
}

function applyUrlToStore(store: ReturnType<typeof getMapStore>): void {
	const facets = paramsToFacets(new URLSearchParams(window.location.search));
	store.aboutOpen = facets.aboutOpen;
	store.activeFilter = facets.activeFilter;
}
