<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { goto } from '$app/navigation';
	import { Search } from '@lucide/svelte';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { people, type Person } from '$lib/data/people';
	import { filterPeople } from '$lib/utils/people';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';
	import { entryKey, entryTitle, type Entry } from '$lib/utils/collection';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	const store = getBrowseStore();
	const searchId = $props.id();
	let searchOpen = $state(false);
	let activeIndex = $state(-1);
	const all = $derived([
		...filterArtworks(artworks, store.filters),
		...filterResidences(residences, store.filters),
		...filterPeople(people, store.filters)
	]);
	const matches = $derived(all.slice(0, 8));
	const open = $derived(searchOpen && store.filters.query.trim().length >= 2);
	function resultKey(item: Entry | Person) {
		return 'paragraphs' in item ? `person:${item.slug}` : entryKey(item);
	}
	function select(item: Entry | Person) {
		searchOpen = false;
		activeIndex = -1;
		if ('paragraphs' in item) void goto(store.personHref(item));
		else {
			store.returnKey = entryKey(item);
			void goto(store.entryHref(item));
		}
	}
	function keys(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			searchOpen = false;
			activeIndex = -1;
		} else if (event.key === 'ArrowDown' && matches.length) {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % matches.length;
		} else if (event.key === 'ArrowUp' && matches.length) {
			event.preventDefault();
			activeIndex = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (activeIndex >= 0 && matches[activeIndex]) select(matches[activeIndex]);
			else {
				searchOpen = false;
				void goto(store.searchHref());
			}
		}
	}
</script>

<svelte:window
	onclick={(event) => {
		if (!(event.target as HTMLElement)?.closest('.search-wrapper')) searchOpen = false;
	}}
/>
<div class="search-wrapper">
	<Search size={17} class="search-icon" aria-hidden="true" />
	<input
		disabled={!store.ready}
		type="search"
		placeholder={store.peopleView ? 'Search people…' : 'Search works, places, people…'}
		aria-label="Search the collection"
		role="combobox"
		aria-expanded={open}
		aria-controls={open ? searchId : undefined}
		aria-autocomplete="list"
		aria-activedescendant={open && activeIndex >= 0 && matches[activeIndex]
			? `${searchId}-${activeIndex}`
			: undefined}
		value={store.filters.query}
		oninput={(event) => {
			store.setFilters({ query: event.currentTarget.value });
			searchOpen = true;
			activeIndex = -1;
		}}
		onfocus={() => (searchOpen = true)}
		onkeydown={keys}
	/>
	{#if open}
		<div class="search-popup">
			<div id={searchId} role="listbox" aria-label="Search results">
				{#each matches as item, index (resultKey(item))}<button
						role="option"
						id="{searchId}-{index}"
						aria-selected={index === activeIndex}
						class:active={index === activeIndex}
						onclick={() => select(item)}
						><span dir="auto">{'paragraphs' in item ? item.name : entryTitle(item)}</span><small
							dir="auto">{'paragraphs' in item ? 'People' : `${item.city}, ${item.country}`}</small
						></button
					>{/each}
			</div>
			{#if !all.length}<p role="status">No entries found. Try clearing another filter.</p>{:else}<a
					href={store.searchHref()}
					onclick={() => (searchOpen = false)}>View all {all.length} results</a
				>{/if}
		</div>
	{/if}
</div>

<style>
	.search-wrapper {
		position: relative;
		width: clamp(210px, 30vw, 380px);
		flex-shrink: 0;
	}
	input {
		width: 100%;
		min-height: 44px;
		padding: var(--space-2) var(--space-3) var(--space-2) 36px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font: inherit;
		font-size: 16px;
		background: var(--color-surface);
		color: var(--color-text);
	}
	input::placeholder {
		color: var(--color-text-muted);
	}
	.search-wrapper :global(.search-icon) {
		position: absolute;
		left: 12px;
		top: 14px;
		color: var(--color-text-secondary);
		pointer-events: none;
	}
	.search-popup {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 60vh;
		overflow: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
		z-index: var(--z-search-results);
	}
	button {
		display: block;
		width: 100%;
		min-height: 44px;
		padding: var(--space-3);
		border: 0;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		text-align: start;
		font: inherit;
		cursor: pointer;
	}
	button:hover,
	button.active {
		background: var(--color-surface-warm);
	}
	small {
		display: block;
		color: var(--color-text-secondary);
		margin-top: var(--space-1);
	}
	.search-popup a,
	.search-popup p {
		display: block;
		padding: var(--space-3);
		color: var(--color-primary-text);
		font-size: var(--text-sm);
	}
	@media (max-width: 768px) {
		.search-wrapper {
			width: 100%;
		}
	}
</style>
