<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { artworks } from '$lib/data/artworks';
	import type { IndexedArtwork } from '$lib/data/types';
	import { searchArtworks } from '$lib/utils/artwork-search';

	let searchInput = $state('');
	let searchOpen = $state(false);
	let activeIndex = $state(-1);
	const searchId = $props.id();
	const listboxId = `${searchId}-results`;
	const matches = $derived(searchArtworks(artworks, searchInput));
	const resultsOpen = $derived(searchOpen && searchInput.trim().length >= 2);

	function selectResult(artwork: IndexedArtwork) {
		searchInput = '';
		searchOpen = false;
		activeIndex = -1;
		void goto(resolve('/artworks/[slug]', { slug: artwork.slug }));
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (!resultsOpen) return;
		if (event.key === 'Escape') {
			event.stopPropagation();
			searchOpen = false;
			activeIndex = -1;
			return;
		}
		if (matches.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % matches.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + matches.length) % matches.length;
		} else if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < matches.length) {
			event.preventDefault();
			selectResult(matches[activeIndex]);
		}
	}
</script>

<svelte:window
	onclick={(event) => {
		if (!(event.target as HTMLElement)?.closest('.search-wrapper')) searchOpen = false;
	}}
/>

<div class="search-wrapper">
	<Search class="search-icon" size={14} strokeWidth={2.5} aria-hidden="true" />
	<input
		type="search"
		class="search-input"
		placeholder="Search artworks…"
		aria-label="Search artworks"
		role="combobox"
		aria-expanded={resultsOpen}
		aria-controls={listboxId}
		aria-autocomplete="list"
		aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
		bind:value={searchInput}
		oninput={() => {
			searchOpen = searchInput.trim().length >= 2;
			activeIndex = -1;
		}}
		onfocus={() => {
			if (searchInput.trim().length >= 2) searchOpen = true;
		}}
		onkeydown={handleSearchKeydown}
	/>

	{#if resultsOpen}
		<div class="search-results" id={listboxId} role="listbox" aria-label="Search results">
			{#if matches.length === 0}
				<div class="search-empty" role="status">No artworks found</div>
			{:else}
				{#each matches as artwork, index (artwork.id)}
					<button
						type="button"
						class="search-item"
						class:keyboard-active={index === activeIndex}
						id="{listboxId}-{index}"
						role="option"
						aria-selected={index === activeIndex}
						onclick={() => selectResult(artwork)}
					>
						<span class="search-item-name">
							<span
								class="search-item-status"
								class:search-status-missing={artwork.status === 'search'}
							></span>
							{artwork.name}
						</span>
						<span class="search-item-loc">{artwork.city}, {artwork.country}</span>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-wrapper {
		position: relative;
		margin-inline-start: auto;
		flex-shrink: 0;
	}
	.search-input {
		width: 230px;
		min-height: 36px;
		padding: var(--space-1-5) var(--space-3-5) var(--space-1-5) 34px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--color-text);
		outline: none;
		background: var(--color-surface);
		transition:
			border-color var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out);
	}
	.search-input::placeholder {
		color: var(--color-text-muted);
	}
	.search-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgb(var(--color-primary-rgb) / 0.1);
	}
	.search-input:focus-visible {
		outline: none;
	}
	:global(.search-icon) {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 14px;
		height: 14px;
		opacity: 0.35;
	}
	.search-results {
		position: absolute;
		top: calc(100% + var(--space-1-5));
		right: 0;
		width: 340px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		max-height: 380px;
		overflow-y: auto;
		z-index: var(--z-search-results);
		border: 1px solid var(--color-border-light);
	}
	.search-item {
		display: block;
		width: 100%;
		min-height: 44px;
		text-align: left;
		font: inherit;
		background: none;
		border: none;
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		border-bottom: 1px solid var(--color-border-light);
		transition: background-color var(--duration-fast) var(--ease-out);
	}
	.search-item:hover,
	.search-item.keyboard-active {
		background: var(--color-surface-warm);
	}
	.search-item:last-child {
		border-bottom: none;
	}
	.search-item-name {
		display: block;
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
	}
	.search-item-loc {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: 3px;
	}
	.search-item-status {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		margin-inline-end: 7px;
		vertical-align: middle;
		background: var(--color-primary);
	}
	.search-status-missing {
		background: var(--color-search);
	}
	.search-empty {
		padding: var(--space-4-5);
		text-align: center;
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-style: italic;
	}
	@media (max-width: 768px) {
		.search-input {
			width: clamp(120px, 28vw, 140px);
			height: 44px;
			min-height: 44px;
			font-size: var(--text-md);
			padding-left: 30px;
			padding-right: var(--space-2-5);
		}
		:global(.search-icon) {
			left: 10px;
		}
		.search-results {
			width: min(280px, calc(100vw - var(--space-7)));
		}
	}
</style>
