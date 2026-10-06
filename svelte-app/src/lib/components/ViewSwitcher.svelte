<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { Map as MapIcon, LayoutGrid, List, Users } from '@lucide/svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { page } from '$app/state';
	let {
		compact = false,
		variant = 'default'
	}: { compact?: boolean; variant?: 'default' | 'header' } = $props();
	const store = getBrowseStore();
	const galleryActive = $derived(
		store.view === 'gallery' && page.route.id !== '/missing' && !store.peopleView
	);
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
		class:active={store.view === 'map'}
		href={store.collectionHref('entries', 'map')}
		aria-label="Map view"
		aria-current={store.view === 'map' ? 'page' : undefined}
		><MapIcon size={15} aria-hidden="true" /><span>Map</span></a
	>
	<a
		class="switch"
		class:active={galleryActive && store.mode !== 'list'}
		href={store.collectionHref(store.mode === 'list' ? 'entries' : store.mode)}
		aria-label="Gallery view"
		aria-current={galleryActive && store.mode !== 'list' ? 'page' : undefined}
		><LayoutGrid size={15} aria-hidden="true" /><span>Gallery</span></a
	>
	<a
		class="switch"
		class:active={galleryActive && store.mode === 'list'}
		href={store.collectionHref('list')}
		aria-label="List view"
		data-view="list"
		aria-current={galleryActive && store.mode === 'list' ? 'page' : undefined}
		><List size={15} aria-hidden="true" /><span>List</span></a
	>
	<a
		class="switch people-switch"
		class:active={store.peopleView}
		href={store.peopleHref()}
		aria-label="People"
		aria-current={store.peopleView ? 'page' : undefined}
		><Users size={15} aria-hidden="true" /><span>People</span></a
	>
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
		.on-header [data-view='list'] {
			display: none;
		}
		/* Six pixels of border/padding surround a full 44px link hit area.
		   Match the sibling header buttons' 50px outer height. */
		.on-header {
			height: 50px;
		}
		.on-header .switch {
			min-width: 44px;
			/* Beats the shared 480px rule's fixed height on specificity — in the
			   header the wrapper owns the height, not the segment. */
			height: auto;
		}
	}
</style>
