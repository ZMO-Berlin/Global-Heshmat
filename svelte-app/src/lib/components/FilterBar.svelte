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
