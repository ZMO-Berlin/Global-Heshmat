<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { artworks } from '$lib/data/artworks';
	import { countries } from '$lib/data/countries';
	import { residences } from '$lib/data/residences';
	import { getMapStore } from '$lib/stores/map.svelte';
	import {
		FILTER_ALL,
		FILTER_RESIDENCE,
		FILTER_SEARCH,
		type MapFilter
	} from '$lib/utils/map-filter';

	let { onselect }: { onselect: (filter: MapFilter) => void } = $props();
	const store = getMapStore();
	const searchCount = artworks.filter((artwork) => artwork.status === 'search').length;
	// Every chip's number is what that chip plots. "All" and the country chips
	// span both collections; "To be found" is artwork-only (residences have no
	// status) and "Places of residence" is residence-only.
	const allCount = artworks.length + residences.length;

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

	function scrollChips(direction: 1 | -1) {
		const el = chipsEl;
		if (!el) return;
		const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
		el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior });
	}

	$effect(() => {
		const el = chipsEl;
		if (!el) return;
		updateArrows();
		const observer = new ResizeObserver(updateArrows);
		observer.observe(el);
		void document.fonts?.ready.then(updateArrows);
		return () => observer.disconnect();
	});

	$effect(() => {
		void store.activeFilter;
		const el = chipsEl;
		if (!el) return;
		const activeEl = el.querySelector<HTMLElement>(
			'.filter-chip.active, .filter-chip.active-search'
		);
		if (activeEl) {
			const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
			const chipCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
			const targetScroll = chipCenter - el.clientWidth / 2;
			el.scrollTo({ left: Math.max(0, targetScroll), behavior });
		}
	});

	const chipsMask = $derived(
		canLeft && canRight
			? 'linear-gradient(to right, transparent, #000 22px, #000 calc(100% - 22px), transparent)'
			: canRight
				? 'linear-gradient(to right, #000 calc(100% - 22px), transparent)'
				: canLeft
					? 'linear-gradient(to right, transparent, #000 22px)'
					: 'none'
	);

	const filterLabelId = $props.id();
</script>

<div class="filter-rail">
	{#if canLeft}
		<button
			type="button"
			class="filter-arrow filter-arrow-left"
			onclick={() => scrollChips(-1)}
			aria-label="Scroll the filter list left"
		>
			<ChevronLeft size={18} strokeWidth={2.5} />
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
			onclick={() => onselect(FILTER_ALL)}
		>
			All <span class="filter-count">{allCount}</span>
		</button>

		<div class="filter-sep"></div>

		{#each countries as country (country.name)}
			<button
				class="filter-chip"
				class:active={store.activeFilter === country.name}
				aria-pressed={store.activeFilter === country.name}
				onclick={() => onselect(country.name)}
			>
				{country.name} <span class="filter-count">{country.count}</span>
			</button>
		{/each}

		<div class="filter-sep"></div>

		<button
			class="filter-chip"
			class:active-search={store.activeFilter === FILTER_SEARCH}
			aria-pressed={store.activeFilter === FILTER_SEARCH}
			onclick={() => onselect(FILTER_SEARCH)}
		>
			To be found <span class="filter-count">{searchCount}</span>
		</button>

		<button
			class="filter-chip"
			class:active={store.activeFilter === FILTER_RESIDENCE}
			aria-pressed={store.activeFilter === FILTER_RESIDENCE}
			onclick={() => onselect(FILTER_RESIDENCE)}
		>
			Places of residence <span class="filter-count">{residences.length}</span>
		</button>
	</div>

	{#if canRight}
		<button
			type="button"
			class="filter-arrow filter-arrow-right"
			onclick={() => scrollChips(1)}
			aria-label="Scroll the filter list right"
		>
			<ChevronRight size={18} strokeWidth={2.5} />
		</button>
	{/if}
</div>

<style>
	.filter-rail {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
	}
	.filter-chips {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-x: contain;
	}
	.filter-chips::-webkit-scrollbar {
		display: none;
	}
	.filter-chips > span:first-child {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin-inline-end: var(--space-1);
		flex-shrink: 0;
	}
	.filter-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
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
		min-height: 32px;
		padding: 4px var(--space-3-5);
		border-radius: var(--radius-pill);
		cursor: pointer;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: 0.01em;
		transition:
			background-color var(--duration-base) var(--ease-out),
			border-color var(--duration-base) var(--ease-out),
			box-shadow var(--duration-base) var(--ease-out),
			color var(--duration-base) var(--ease-out);
		user-select: none;
		white-space: nowrap;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
	}
	.filter-chip:hover {
		border-color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
	}
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
	.filter-count {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		font-variant-numeric: tabular-nums;
		opacity: 0.6;
		margin-inline-start: 1px;
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
	@media (max-width: 768px) {
		.filter-chips > span:first-child {
			display: none;
		}
		.filter-arrow {
			display: none;
		}
		.filter-chip {
			min-height: 44px;
			height: 44px;
			padding: 0 var(--space-3-5);
			font-size: var(--text-xs);
			flex-shrink: 0;
		}
	}
</style>
