<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- The browse store and resolve() below build internal routes. */
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { FunnelX, PanelLeftOpen, SlidersHorizontal } from '@lucide/svelte';
	import { peopleGroups } from '$lib/data/people/_groups';
	import type { CollectionFilters } from '$lib/utils/map-filter';
	import { countries } from '$lib/data/countries';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import ArtworkSearch from './ArtworkSearch.svelte';
	const store = getBrowseStore();
	// Phones fold the facets behind a Filters button; on wider screens the
	// panel is always inline and this state is ignored.
	let facetsOpen = $state(false);
	let toggle = $state<HTMLButtonElement>();
	let panel = $state<HTMLDivElement>();
	const active = $derived(
		store.peopleView
			? Number(!!store.filters.group) + Number(!!store.filters.place)
			: Number(!!store.filters.country) +
					Number(store.filters.status !== 'all') +
					Number(store.filters.type !== 'all')
	);
	$effect(() => {
		void page.url.pathname;
		facetsOpen = false;
	});
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

<!-- Capture phase: Escape folds the facets before the layout's own Escape handling sees it. -->
<svelte:window
	onkeydowncapture={(event) => {
		if (event.key !== 'Escape' || !facetsOpen) return;
		event.stopPropagation();
		facetsOpen = false;
		toggle?.focus();
	}}
	onclick={(event) => {
		const target = event.target as Node;
		if (facetsOpen && !panel?.contains(target) && !toggle?.contains(target)) facetsOpen = false;
	}}
/>

<div class="filters" role="search" aria-label="Filter the collection">
	<ArtworkSearch />
	{#if store.view === 'map'}<button
			disabled={!store.ready}
			class="clear browse"
			onclick={() => (store.browseOpen = !store.browseOpen)}
			aria-label="Browse entries"
			aria-expanded={store.browseOpen}
			><PanelLeftOpen size={18} aria-hidden="true" /><span class="button-text">Browse</span></button
		>{/if}
	<button
		bind:this={toggle}
		class="facets-toggle"
		class:open={facetsOpen}
		disabled={!store.ready}
		aria-expanded={facetsOpen}
		aria-controls="facet-panel"
		onclick={() => (facetsOpen = !facetsOpen)}
		><SlidersHorizontal size={17} aria-hidden="true" />Filters{#if active}<span
				class="active-count"
				aria-hidden="true">{active}</span
			><span class="sr-only">, {active} active</span>{/if}</button
	>
	<div class="facet-controls" class:open={facetsOpen} id="facet-panel" bind:this={panel}>
		{#if store.peopleView}
			<label
				><span class="sr-only">Group</span><select
					aria-label="Group"
					disabled={!store.ready}
					value={store.filters.group ?? ''}
					onchange={(event) => peopleFacet({ group: event.currentTarget.value })}
				>
					<option value="">Group</option>
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
					<option value="">Place</option>
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
					><option value="">Country</option>{#each countries as country (country.name)}<option
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
					><option value="all">Status</option><option value="located">Located</option><option
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
				><option value="all">Type</option><option value="artwork">Artworks / sites</option><option
					value="residence">Residences</option
				><option value="person">People</option></select
			></label
		>
		<button
			disabled={!store.ready}
			class="clear"
			onclick={() => store.resetFilters()}
			aria-label="Clear all filters"
			><FunnelX size={18} aria-hidden="true" /><span class="button-text">Clear</span></button
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1-5);
		min-width: 44px;
		min-height: 44px;
		padding: var(--space-2);
		border: 0;
		background: transparent;
		color: var(--color-primary-text);
		font: inherit;
		cursor: pointer;
	}
	.facets-toggle {
		display: none;
	}
	@media (max-width: 768px) {
		.filters {
			padding: 0 var(--space-3);
			gap: var(--space-1-5);
		}
		.browse .button-text {
			display: none;
		}
		.facets-toggle {
			display: inline-flex;
			align-items: center;
			gap: var(--space-1-5);
			flex-shrink: 0;
			min-height: 44px;
			padding: 0 var(--space-3);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-sm);
			background: var(--color-surface);
			color: var(--color-primary-text);
			font: inherit;
			font-size: var(--text-sm);
			font-weight: var(--weight-medium);
			cursor: pointer;
			transition:
				border-color var(--duration-fast) var(--ease-out),
				background-color var(--duration-fast) var(--ease-out);
		}
		.facets-toggle.open {
			border-color: var(--color-primary-text);
			background: var(--color-primary-light);
		}
		.active-count {
			display: inline-grid;
			place-items: center;
			min-width: 18px;
			height: 18px;
			padding: 0 5px;
			border-radius: var(--radius-pill);
			background: var(--color-primary-text);
			color: var(--color-surface);
			font-size: var(--text-xs);
			font-weight: var(--weight-bold);
			font-variant-numeric: tabular-nums;
			line-height: 1;
		}
		/* The facets drop below the bar as a two-column sheet over the page. */
		.facet-controls {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			grid-template-columns: 1fr 1fr;
			gap: var(--space-2);
			padding: var(--space-3);
			background: var(--color-surface-warm);
			border-bottom: 1px solid var(--color-filter-border);
			box-shadow: var(--shadow-md);
		}
		.facet-controls.open {
			display: grid;
		}
		.facet-controls .clear {
			border: 1px solid var(--color-border);
			border-radius: var(--radius-sm);
			background: var(--color-surface);
			font-size: var(--text-sm);
		}
	}
</style>
