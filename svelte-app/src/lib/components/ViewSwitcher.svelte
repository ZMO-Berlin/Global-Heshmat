<script lang="ts">
	import { Map as MapIcon, LayoutGrid, List } from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getMapStore } from '$lib/stores/map.svelte';

	/**
	 * Switches between the three ways of reading the collection: the map, the
	 * photo grid, and the side list.
	 *
	 * Map and grid are real routes, so they are links — shareable, crawlable and
	 * middle-clickable. The list is a panel over whichever route you are on, so
	 * it is a button. `current` marks whichever one you are looking at.
	 *
	 * `onreset` upgrades the map segment from "navigate home" to the header's
	 * full World View reset (clear filter, clear selection, recentre). Passing it
	 * is what lets this replace a separate reset control.
	 */
	let {
		compact = false,
		variant = 'default',
		onreset
	}: {
		compact?: boolean;
		variant?: 'default' | 'header';
		onreset?: () => void;
	} = $props();

	const store = getMapStore();

	const onGrid = $derived(page.url.pathname.replace(/\/$/, '').endsWith('/collection'));
	// The map is "current" whenever you are not on the grid and the list is shut.
	const onMap = $derived(!onGrid && !store.browseOpen);

	function selectMap(event: MouseEvent) {
		store.browseOpen = false;
		if (!onreset) return;
		// Keep middle-click and ctrl/cmd-click behaving like the plain link they
		// are; only a normal activation should run the reset in place.
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
			return;
		event.preventDefault();
		onreset();
	}
</script>

<div
	class="switcher"
	class:compact
	class:on-header={variant === 'header'}
	role="group"
	aria-label="Choose how to view the collection"
>
	<a
		class="switch"
		class:active={onMap}
		href={resolve('/')}
		aria-label={onreset ? 'World view' : 'Map view'}
		aria-current={onMap ? 'page' : undefined}
		onclick={selectMap}
	>
		<MapIcon size={14} strokeWidth={2.25} aria-hidden="true" />
		<span>Map</span>
	</a>
	<a
		class="switch"
		class:active={onGrid}
		href={resolve('/collection')}
		aria-label="Grid view"
		aria-current={onGrid ? 'page' : undefined}
		onclick={() => (store.browseOpen = false)}
	>
		<LayoutGrid size={14} strokeWidth={2.25} aria-hidden="true" />
		<span>Grid</span>
	</a>
	<!-- A disclosure, not a page: it reveals the collection panel over whatever
	     route you are on, so it carries expanded/controls rather than current. -->
	<button
		class="switch"
		class:active={store.browseOpen}
		aria-label="List view"
		aria-expanded={store.browseOpen}
		aria-controls="collection"
		onclick={() => (store.browseOpen = !store.browseOpen)}
	>
		<List size={14} strokeWidth={2.25} aria-hidden="true" />
		<span>List</span>
	</button>
</div>

<style>
	.switcher {
		display: inline-flex;
		align-items: stretch;
		gap: 2px;
		padding: 2px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface-warm);
	}
	.switch {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-1-5) var(--space-3-5);
		border: none;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--color-text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}
	.switch:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}
	.switch.active {
		background: var(--color-surface);
		color: var(--color-ink);
		box-shadow: var(--shadow-sm);
	}

	/* Icon-only, for the panel header where space is tight. */
	.compact .switch span {
		display: none;
	}
	.compact .switch {
		padding: var(--space-1-5) var(--space-2-5);
	}

	/* ── Header variant ──────────────────────────────
	   Sits on the dark header bar, so it borrows the accent-tinted idiom the
	   sibling .header-btn controls use instead of the light surface fills. */
	.on-header {
		/* Take .header-btn's exact box. Everything is border-box, so the 1px
		   border and 2px padding sit inside this height instead of adding to a
		   segment height — otherwise the pill stands proud of About and the CTA
		   above and below, which reads as misalignment even though the centres
		   agree. Segments stretch to fill (align-items: stretch). */
		height: 36px;
		border-color: rgb(var(--color-header-text-rgb) / 0.2);
		background: transparent;
	}
	.on-header .switch {
		min-height: 0;
		padding: var(--space-1) var(--space-3);
		color: rgb(var(--color-header-text-rgb) / 0.75);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}
	.on-header .switch:hover {
		background: rgb(var(--color-accent-rgb) / 0.15);
		color: var(--color-on-dark);
	}
	.on-header .switch.active {
		background: rgb(var(--color-accent-rgb) / 0.22);
		color: var(--color-on-dark);
		box-shadow: none;
	}

	@media (max-width: 480px) {
		.switch span {
			display: none;
		}
		.switch {
			min-width: 44px;
			height: 44px;
			padding: var(--space-1-5) var(--space-2-5);
		}
	}

	/* The header carries the wordmark, this switcher, About and the CTA. Three
	   labelled segments stop fitting well before the other controls do, so drop
	   to icons here rather than at the shared 480px breakpoint. */
	@media (max-width: 900px) {
		.on-header .switch span {
			display: none;
		}
		.on-header .switch {
			min-width: 40px;
			justify-content: center;
			padding: var(--space-1) var(--space-2);
		}
	}
	@media (max-width: 768px) {
		/* .header-btn grows to 44px on phones; keep the group's outer box
		   identical so all three controls share a top and bottom edge. */
		.on-header {
			height: 44px;
		}
		.on-header .switch {
			min-width: 44px;
			/* Beats the shared 480px rule's fixed height on specificity — in the
			   header the wrapper owns the height, not the segment. */
			height: auto;
		}
	}
</style>
