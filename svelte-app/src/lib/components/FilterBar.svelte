<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- The browse store and resolve() below build internal routes. */
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { peopleGroups } from '$lib/data/people/_groups';
	import type { CollectionFilters } from '$lib/utils/map-filter';
	import { countries } from '$lib/data/countries';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import ArtworkSearch from './ArtworkSearch.svelte';
	const store = getBrowseStore();
	function changeType(type: CollectionFilters['type']) {
		if (type === 'person') void goto(store.peopleHref({ group: '', place: '' }));
		else {
			store.setFilters({ type, group: '', place: '' });
			if (store.peopleView) {
				const params = new SvelteURLSearchParams();
				if (type !== 'all') params.set('type', type);
				if (store.filters.query) params.set('q', store.filters.query);
				void goto(resolve('/collection') + (params.size ? `?${params}` : ''));
			}
		}
	}
	function peopleFacet(patch: Partial<CollectionFilters>) {
		if (page.route.id === '/people') store.setFilters(patch);
		else void goto(store.peopleHref(patch));
	}
</script>

<div class="filters" role="search" aria-label="Filter the collection">
	<ArtworkSearch />
	<div class="facet-controls">
		{#if store.view === 'map'}<button
				disabled={!store.ready}
				class="clear"
				onclick={() => (store.browseOpen = !store.browseOpen)}
				aria-expanded={store.browseOpen}>Browse</button
			>{/if}
		{#if store.peopleView}
			<label
				><span class="sr-only">Group</span><select
					aria-label="Group"
					disabled={!store.ready}
					value={store.filters.group ?? ''}
					onchange={(event) => peopleFacet({ group: event.currentTarget.value })}
				>
					<option value="">All groups</option>
					{#each peopleGroups as group (group.id)}<option value={group.id}>{group.name}</option
						>{/each}
				</select></label
			>
			<label
				><span class="sr-only">Place mentioned</span><select
					aria-label="Place mentioned"
					disabled={!store.ready}
					value={store.filters.place ?? ''}
					onchange={(event) => peopleFacet({ place: event.currentTarget.value })}
				>
					<option value="">All places mentioned</option>
					{#each page.data.peoplePlaces ?? [] as place (place)}<option value={place}>{place}</option
						>{/each}
				</select></label
			>
		{:else}
			<label
				><span class="sr-only">Country</span><select
					aria-label="Country"
					disabled={!store.ready}
					value={store.filters.country}
					onchange={(event) => store.setFilters({ country: event.currentTarget.value })}
					><option value="">All countries</option>{#each countries as country (country.name)}<option
							value={country.name}>{country.name}</option
						>{/each}</select
				></label
			>
			<label
				><span class="sr-only">Status</span><select
					aria-label="Status"
					disabled={!store.ready || page.route.id === '/missing'}
					value={store.filters.status}
					onchange={(event) =>
						store.setFilters({ status: event.currentTarget.value as 'all' | 'located' | 'search' })}
					><option value="all">All statuses</option><option value="located">Located</option><option
						value="search">To be found</option
					></select
				></label
			>
		{/if}
		<label
			><span class="sr-only">Entry type</span><select
				aria-label="Entry type"
				disabled={!store.ready}
				value={store.filters.type}
				onchange={(event) => changeType(event.currentTarget.value as CollectionFilters['type'])}
				><option value="all">All entries</option><option value="artwork">Artworks / sites</option
				><option value="residence">Residences</option><option value="person">People</option></select
			></label
		>
		<button
			disabled={!store.ready}
			class="clear"
			onclick={() => store.resetFilters()}
			aria-label="Clear all filters">Clear</button
		>
	</div>
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
		gap: var(--space-3);
	}
	.facet-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
		flex: 1;
	}
	label {
		min-width: 0;
		flex: 1;
	}
	select {
		width: 100%;
		min-height: 44px;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		font-size: var(--text-sm);
		text-overflow: ellipsis;
	}
	.clear {
		min-height: 44px;
		padding: var(--space-2);
		border: 0;
		background: transparent;
		color: var(--color-primary-text);
		font: inherit;
		cursor: pointer;
	}
	@media (max-width: 768px) {
		.filters {
			padding: var(--space-2) var(--space-3);
			flex-direction: column;
			gap: var(--space-1);
			align-items: stretch;
		}
		.facet-controls {
			width: 100%;
			gap: var(--space-1);
		}
		select {
			font-size: var(--text-xs);
			padding: var(--space-1);
		}
		.clear {
			font-size: var(--text-xs);
		}
	}
</style>
