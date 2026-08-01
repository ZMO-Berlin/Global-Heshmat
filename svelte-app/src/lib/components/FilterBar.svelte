<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getMapStore } from '$lib/stores/map.svelte';
	import type { MapFilter } from '$lib/utils/map-filter';
	import ArtworkSearch from './ArtworkSearch.svelte';
	import FilterChips from './FilterChips.svelte';

	const store = getMapStore();

	function setFilter(filter: MapFilter) {
		store.activeFilter = filter;
		store.selectedArtwork = null;
		store.selectedResidence = null;
		if (page.route.id === '/artworks/[slug]' || page.route.id === '/residences/[slug]') {
			void goto(resolve('/'));
		}
	}
</script>

<div class="filters">
	<FilterChips onselect={setFilter} />
	<ArtworkSearch />
</div>

<style>
	.filters {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		z-index: var(--z-filter);
		height: var(--filter-height);
		background: var(--color-surface-warm);
		border-bottom: 1px solid var(--color-filter-border);
		display: flex;
		align-items: center;
		padding: 0 var(--space-7);
		gap: var(--space-2);
		font-size: var(--text-base);
		color: var(--color-text-secondary);
	}
	@media (max-width: 768px) {
		.filters {
			padding: 0 var(--space-3-5);
		}
	}
</style>
