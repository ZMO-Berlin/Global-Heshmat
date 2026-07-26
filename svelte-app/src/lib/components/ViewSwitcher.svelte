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
	 */
	let { compact = false }: { compact?: boolean } = $props();

	const store = getMapStore();

	const onGrid = $derived(page.url.pathname.replace(/\/$/, '').endsWith('/collection'));
	// The map is "current" whenever you are not on the grid and the list is shut.
	const onMap = $derived(!onGrid && !store.browseOpen);
</script>

<div class="switcher" class:compact role="group" aria-label="Choose how to view the collection">
	<a
		class="switch"
		class:active={onMap}
		href={resolve('/')}
		aria-current={onMap ? 'page' : undefined}
		onclick={() => (store.browseOpen = false)}
	>
		<MapIcon size={14} strokeWidth={2.25} aria-hidden="true" />
		<span>Map</span>
	</a>
	<a
		class="switch"
		class:active={onGrid}
		href={resolve('/collection')}
		aria-current={onGrid ? 'page' : undefined}
		onclick={() => (store.browseOpen = false)}
	>
		<LayoutGrid size={14} strokeWidth={2.25} aria-hidden="true" />
		<span>Grid</span>
	</a>
	<button
		class="switch"
		class:active={store.browseOpen}
		aria-pressed={store.browseOpen}
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

	@media (max-width: 480px) {
		.switch span {
			display: none;
		}
		.switch {
			padding: var(--space-1-5) var(--space-2-5);
		}
	}
</style>
