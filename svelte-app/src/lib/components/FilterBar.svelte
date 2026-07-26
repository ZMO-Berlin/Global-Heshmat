<script lang="ts">
	import { Search, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { artworks, countries } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import type { IndexedArtwork } from '$lib/data/types';
	import { getMapStore } from '$lib/stores/map.svelte';
	import {
		FILTER_ALL,
		FILTER_RESIDENCE,
		FILTER_SEARCH,
		type MapFilter
	} from '$lib/utils/map-filter';

	const store = getMapStore();

	// Chip counts. Constant for the lifetime of the app (the data is compiled
	// in), so computed once rather than in a $derived.
	const searchCount = artworks.filter((a) => a.status === 'search').length;

	let searchInput = $state('');
	let searchOpen = $state(false);

	// Country chip rail. It already scrolls horizontally when the chips overflow
	// (common on mobile and narrow desktops). Track whether content is hidden on
	// each side so we can show a scroll arrow there and fade only that edge —
	// making the scroll discoverable, and never clipping the last chip at rest.
	let chipsEl: HTMLDivElement | undefined = $state();
	let canLeft = $state(false);
	let canRight = $state(false);

	function updateArrows() {
		const el = chipsEl;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		canLeft = el.scrollLeft > 1;
		canRight = el.scrollLeft < max - 1;
	}

	function scrollChips(dir: 1 | -1) {
		chipsEl?.scrollBy({ left: dir * chipsEl.clientWidth * 0.7, behavior: 'smooth' });
	}

	// Recompute when the rail mounts and whenever it resizes (viewport change).
	// Web fonts load after first paint and change chip widths, so recheck once
	// they're ready too.
	$effect(() => {
		const el = chipsEl;
		if (!el) return;
		updateArrows();
		const ro = new ResizeObserver(updateArrows);
		ro.observe(el);
		document.fonts?.ready.then(updateArrows);
		return () => ro.disconnect();
	});

	// Fade only the edge(s) with more content — never the resting end, so the
	// last chip shows in full once there's nothing further to scroll to.
	const chipsMask = $derived(
		canLeft && canRight
			? 'linear-gradient(to right, transparent, #000 22px, #000 calc(100% - 22px), transparent)'
			: canRight
				? 'linear-gradient(to right, #000 calc(100% - 22px), transparent)'
				: canLeft
					? 'linear-gradient(to right, transparent, #000 22px)'
					: 'none'
	);

	const matches = $derived.by(() => {
		const q = searchInput.trim().toLowerCase();
		if (q.length < 2) return [];
		const words = q.split(/\s+/);
		return artworks
			.filter((a) => {
				const searchable = `${a.name} ${a.city} ${a.country} ${a.address}`.toLowerCase();
				return words.every((w) => searchable.includes(w));
			})
			.slice(0, 8);
	});

	// Combobox keyboard support: ArrowDown/ArrowUp move the highlighted
	// result, Enter opens it, Escape dismisses the list. The highlight is
	// exposed to screen readers via aria-activedescendant on the input.
	const uid = $props.id();
	const listboxId = `${uid}-results`;
	// Associates the "Filter:" caption with the chip group for screen readers.
	const filterLabelId = `${uid}-filter-label`;
	let activeIndex = $state(-1);
	const resultsOpen = $derived(searchOpen && searchInput.trim().length >= 2);

	function handleSearchKeydown(e: KeyboardEvent) {
		if (!resultsOpen || matches.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % matches.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + matches.length) % matches.length;
		} else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < matches.length) {
			e.preventDefault();
			selectResult(matches[activeIndex]);
		} else if (e.key === 'Escape') {
			// Consume the Escape: it closes the dropdown, not the sidebar or
			// a modal (the layout's window-level handler would act otherwise).
			e.stopPropagation();
			searchOpen = false;
		}
	}

	function setFilter(filter: MapFilter) {
		store.activeFilter = filter;
		store.selectedArtwork = null;
		store.selectedResidence = null;
		// A detail route owns the selection it displays; picking a filter
		// dismisses that view, so also navigate home rather than leaving a
		// stale /artworks/<slug> or /residences/<slug> URL behind. The
		// filter itself is re-appended to the URL by the url-sync effect.
		if (page.route.id !== '/') goto(resolve('/'));
	}

	// Navigate to the artwork's canonical URL, exactly like clicking its map
	// marker — the /artworks/[slug]/ page then sets the store selection. Going
	// through the router (rather than setting the store directly) keeps the
	// URL shareable and lets the close button / Escape / Back all work.
	function selectResult(artwork: IndexedArtwork) {
		searchInput = '';
		searchOpen = false;
		activeIndex = -1;
		goto(resolve('/artworks/[slug]', { slug: artwork.slug }));
	}

	function handleSearchFocus() {
		if (searchInput.trim().length >= 2) searchOpen = true;
	}
</script>

<svelte:window
	onclick={(e) => {
		if (!(e.target as HTMLElement)?.closest('.search-wrapper')) {
			searchOpen = false;
		}
	}}
/>

<div class="filters">
	<div class="filter-rail">
		{#if canLeft}
			<button
				type="button"
				class="filter-arrow filter-arrow-left"
				transition:fade={{ duration: 120 }}
				onclick={() => scrollChips(-1)}
				aria-label="Scroll the filter list left"
			>
				<ChevronLeft size={16} strokeWidth={2.5} />
			</button>
		{/if}

		<div
			class="filter-chips"
			role="group"
			aria-labelledby={filterLabelId}
			bind:this={chipsEl}
			onscroll={updateArrows}
			style="mask-image:{chipsMask};-webkit-mask-image:{chipsMask}"
		>
			<span id={filterLabelId}>Filter:</span>

			<button
				class="filter-chip"
				class:active={store.activeFilter === FILTER_ALL}
				aria-pressed={store.activeFilter === FILTER_ALL}
				onclick={() => setFilter(FILTER_ALL)}
			>
				All <span class="filter-count">{artworks.length}</span>
			</button>

			<div class="filter-sep"></div>

			{#each countries as country (country.name)}
				<button
					class="filter-chip"
					class:active={store.activeFilter === country.name}
					aria-pressed={store.activeFilter === country.name}
					onclick={() => setFilter(country.name)}
				>
					{country.name} <span class="filter-count">{country.count}</span>
				</button>
			{/each}

			<div class="filter-sep"></div>

			<button
				class="filter-chip"
				class:active-search={store.activeFilter === FILTER_SEARCH}
				aria-pressed={store.activeFilter === FILTER_SEARCH}
				onclick={() => setFilter(FILTER_SEARCH)}
			>
				To be found <span class="filter-count">{searchCount}</span>
			</button>

			<button
				class="filter-chip"
				class:active={store.activeFilter === FILTER_RESIDENCE}
				aria-pressed={store.activeFilter === FILTER_RESIDENCE}
				onclick={() => setFilter(FILTER_RESIDENCE)}
			>
				Places of residence <span class="filter-count">{residences.length}</span>
			</button>
		</div>

		{#if canRight}
			<button
				type="button"
				class="filter-arrow filter-arrow-right"
				transition:fade={{ duration: 120 }}
				onclick={() => scrollChips(1)}
				aria-label="Scroll the filter list right"
			>
				<ChevronRight size={16} strokeWidth={2.5} />
			</button>
		{/if}
	</div>

	<div class="search-wrapper">
		<Search class="search-icon" size={14} strokeWidth={2.5} />
		<input
			type="text"
			class="search-input"
			placeholder="Search artworks..."
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
			onfocus={handleSearchFocus}
			onkeydown={handleSearchKeydown}
		/>

		{#if resultsOpen}
			<div class="search-results" id={listboxId} role="listbox" aria-label="Search results">
				{#if matches.length === 0}
					<div class="search-empty" role="status">No artworks found</div>
				{:else}
					{#each matches as a, i (a.id)}
						<button
							type="button"
							class="search-item"
							class:keyboard-active={i === activeIndex}
							id="{listboxId}-{i}"
							role="option"
							aria-selected={i === activeIndex}
							onclick={() => selectResult(a)}
						>
							<span class="search-item-name">
								<span
									class="search-item-status"
									style="background:{a.status === 'search'
										? 'var(--color-search)'
										: 'var(--color-primary)'}"
								></span>
								{a.name}
							</span>
							<span class="search-item-loc">{a.city}, {a.country}</span>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Filter chip rail and the artwork search combobox. */
	/* ═══════════════════════════════════════════
	   Filter Bar
	   ═══════════════════════════════════════════ */
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

	/* The chip rail wraps the scroller plus its two scroll arrows. position:relative
	   anchors the arrows to the rail's own edges — so the right arrow sits at the
	   chips' right edge, never on top of the search box. */
	.filter-rail {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
	}

	/* Chip group: a single row that scrolls horizontally when the chips don't
	   fit (narrow desktop, and especially mobile) so every country stays
	   reachable. The search box is a sibling of the rail, so it never scrolls
	   out of reach. */
	.filter-chips {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none; /* Firefox */
		-webkit-overflow-scrolling: touch;
		/* The edge fade is applied inline and tracks scroll position (see
		   FilterBar.svelte): only the side with more content fades, so the resting
		   end stays crisp and the last chip is never clipped. */
	}

	.filter-chips::-webkit-scrollbar {
		display: none; /* Chrome/Safari/Edge */
	}

	.filter-chips > span:first-child {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin-right: var(--space-1);
	}

	/* Scroll arrows: shown only when content is hidden on that side. They overlay
	   the faded edge of the rail and nudge the row by roughly a screenful. */
	.filter-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		transition:
			border-color var(--duration-base) var(--ease-out),
			color var(--duration-base) var(--ease-out);
	}

	.filter-arrow:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.filter-arrow-left {
		left: 0;
	}

	.filter-arrow-right {
		right: 0;
	}

	.filter-chip {
		padding: 5px var(--space-3-5);
		border-radius: var(--radius-pill);
		cursor: pointer;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: 0.01em;
		transition: all var(--duration-base) var(--ease-out);
		user-select: none;
		white-space: nowrap;
	}

	.filter-chip:hover {
		border-color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
	}

	/* The active fill uses the text-safe tone, not the marker hue: white on
	   --color-primary is only 4.22:1 (and 3.77:1 on --color-search), which the
	   12px chip label doesn't clear. Same hue, a shade deeper. */
	.filter-chip.active {
		background: var(--color-primary-text);
		color: var(--color-on-dark);
		border-color: var(--color-primary-text);
		box-shadow: var(--shadow-chip-active);
	}

	.filter-chip.active-search {
		background: var(--color-search-text);
		color: var(--color-on-dark);
		border-color: var(--color-search-text);
		box-shadow: var(--shadow-chip-active-search);
	}

	/* Per-chip artwork count. Tabular numerals keep the counts from jittering the
	   chip widths, and the muted weight keeps them subordinate to the label. */
	.filter-count {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		font-variant-numeric: tabular-nums;
		opacity: 0.6;
		margin-left: 1px;
	}

	.filter-chip.active .filter-count,
	.filter-chip.active-search .filter-count {
		opacity: 0.75;
	}

	.filter-sep {
		width: 1px;
		height: 18px;
		background: var(--color-border);
		margin: 0 var(--space-1);
		flex-shrink: 0;
	}

	/* ═══════════════════════════════════════════
	   Search
	   ═══════════════════════════════════════════ */
	.search-wrapper {
		position: relative;
		margin-left: auto;
		flex-shrink: 0;
	}

	.search-input {
		width: 230px;
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
		outline: none; /* the focus ring is the box-shadow above */
	}

	/* The icon is a Lucide component, so its <svg> is compiled in that
	   component's scope, not ours — the selector must be :global(). */
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
		top: 42px;
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
		text-align: left;
		font: inherit;
		background: none;
		border: none;
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		border-bottom: 1px solid var(--color-border-light);
		transition: background var(--duration-fast) var(--ease-out);
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
		margin-right: 7px;
		vertical-align: middle;
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
			width: 140px;
		}

		.search-results {
			width: 280px;
		}

		.filters {
			padding: 0 var(--space-3-5);
		}

		/* Hide the "Filter:" label on phones — the chips speak for themselves and
			   the row needs every pixel. */
		.filter-chips > span:first-child {
			display: none;
		}

		.filter-chip {
			padding: 3px var(--space-2-5);
			font-size: var(--text-xs);
		}
	}
</style>
