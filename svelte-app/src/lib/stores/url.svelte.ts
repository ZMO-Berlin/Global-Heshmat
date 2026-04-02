import { SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';
import { getMapStore } from './map.svelte';
import { artworks } from '$lib/data/artworks';

const store = getMapStore();

/**
 * Sync the browser URL query parameter `?artwork=<id>` with the selected artwork.
 *
 * - On init (page load), reads the current URL and auto-selects the matching artwork.
 * - Reactively updates the URL whenever `store.selectedArtwork` changes.
 *
 * Uses `history.replaceState` to avoid polluting the browser history stack.
 */
export function initUrlSync() {
	// --- Read URL on load and select the artwork if present ---
	if (typeof window !== 'undefined') {
		const params = new SvelteURLSearchParams(window.location.search);
		const artworkId = params.get('artwork');
		if (artworkId) {
			const id = Number(artworkId);
			if (!Number.isNaN(id)) {
				const match = artworks.find((a) => a.id === id);
				if (match) {
					store.selectedArtwork = match;
				}
			}
		}
	}

	// --- Reactively push URL changes when the selection changes ---
	$effect(() => {
		const selected = store.selectedArtwork;

		if (typeof window === 'undefined') return;

		const url = new SvelteURL(window.location.href);

		if (selected) {
			url.searchParams.set('artwork', String(selected.id));
		} else {
			url.searchParams.delete('artwork');
		}

		// Only update if the URL actually changed
		if (url.href !== window.location.href) {
			history.replaceState(history.state, '', url.href);
		}
	});
}
