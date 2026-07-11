<script lang="ts">
	import { Search, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { artworks, countries } from '$lib/data/artworks';
	import type { Artwork } from '$lib/data/types';
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

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

	function setFilter(filter: string) {
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
	function selectResult(artwork: Artwork) {
		searchInput = '';
		searchOpen = false;
		goto(resolve('/artworks/[slug]', { slug: artwork.slug! }));
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
			bind:this={chipsEl}
			onscroll={updateArrows}
			style="mask-image:{chipsMask};-webkit-mask-image:{chipsMask}"
		>
			<span>Filter:</span>

			<button
				class="filter-chip"
				class:active={store.activeFilter === 'all'}
				onclick={() => setFilter('all')}
			>
				All
			</button>

			<div class="filter-sep"></div>

			{#each countries as country (country)}
				<button
					class="filter-chip"
					class:active={store.activeFilter === country}
					onclick={() => setFilter(country)}
				>
					{country}
				</button>
			{/each}

			<div class="filter-sep"></div>

			<button
				class="filter-chip"
				class:active-search={store.activeFilter === 'search'}
				onclick={() => setFilter('search')}
			>
				To be found
			</button>

			<button
				class="filter-chip"
				class:active={store.activeFilter === 'residence'}
				onclick={() => setFilter('residence')}
			>
				Places of residence
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
			bind:value={searchInput}
			oninput={() => (searchOpen = searchInput.trim().length >= 2)}
			onfocus={handleSearchFocus}
		/>

		{#if searchOpen && searchInput.trim().length >= 2}
			<div class="search-results">
				{#if matches.length === 0}
					<div class="search-empty">No artworks found</div>
				{:else}
					{#each matches as a (a.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="search-item" onclick={() => selectResult(a)}>
							<div class="search-item-name">
								<span
									class="search-item-status"
									style="background:{a.status === 'search'
										? 'var(--color-search)'
										: 'var(--color-primary)'}"
								></span>
								{a.name}
							</div>
							<div class="search-item-loc">{a.city}, {a.country}</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
