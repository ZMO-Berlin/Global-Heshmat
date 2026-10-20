<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- hrefs come from the browse store and resolve() in navItems. */
	import { Map as MapIcon, LayoutGrid, List, Users, Route, BookMarked } from '@lucide/svelte';
	import { page } from '$app/state';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import { navItems, type NavItem } from '$lib/utils/navigation';
	import FieldbookCount from './FieldbookCount.svelte';
	const store = getBrowseStore();
	const fieldbook = getFieldbook();
	const icons = {
		map: MapIcon,
		gallery: LayoutGrid,
		list: List,
		people: Users,
		trails: Route,
		fieldbook: BookMarked
	};
	const items = $derived(navItems(store, page.route.id));
	// Views of the collection, then the research tools that span it.
	const groups = $derived([items.slice(0, 4), items.slice(4)]);
	// The tab bar has no List tab (it is a mode inside the gallery), so there
	// Gallery also reads as current while the list is open.
	const listCurrent = $derived(items.some((item) => item.id === 'list' && item.current));
	const name = (item: NavItem) =>
		item.id === 'fieldbook' && fieldbook.keys.length
			? `${item.name}, ${fieldbook.keys.length} saved`
			: item.name;
</script>

<!-- One menu, two presentations: pill groups in the header from 1024px, and
     below that a tab bar fixed to the bottom edge, within thumb reach. Being
     one element keeps the two in step and hydrates once. -->
<nav class="site-nav" aria-label="Main">
	{#each groups as group, index (index)}<ul class:views={index === 0}>
			{#each group as item (item.id)}{@const Icon = icons[item.id]}
				<li class="item-{item.id}">
					<a
						href={item.href}
						class:current={item.current}
						class:tab-current={item.id === 'gallery' && listCurrent}
						aria-current={item.current ? 'page' : undefined}
						aria-label={name(item)}
						title={index === 0 ? item.label : undefined}
						><span class="icon"
							><Icon size={22} aria-hidden="true" />{#if item.id === 'fieldbook'}<FieldbookCount
								/>{/if}</span
						><span class="label">{item.label}</span></a
					>
				</li>{/each}
		</ul>{/each}
</nav>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
	}
	a {
		text-decoration: none;
		white-space: nowrap;
		font-family: var(--font-body);
		font-weight: var(--weight-medium);
	}

	/* ── Desktop: two pill groups on the navy header ── */
	@media (min-width: 1024px) {
		.site-nav {
			display: flex;
			align-items: center;
			gap: var(--space-2-5);
		}
		ul {
			display: flex;
			align-items: stretch;
			gap: 2px;
			/* The same 36px box as the sibling .header-btn pills: border and
			   padding sit inside it, so the groups line up with About and the CTA. */
			height: 36px;
			padding: 2px;
			border: 1px solid rgb(var(--color-header-text-rgb) / 0.2);
			border-radius: var(--radius-pill);
		}
		a {
			display: inline-flex;
			align-items: center;
			gap: var(--space-1-5);
			padding: var(--space-1) var(--space-3);
			border-radius: var(--radius-pill);
			color: rgb(var(--color-header-text-rgb) / 0.75);
			font-size: var(--text-sm);
			letter-spacing: var(--tracking-wider);
			text-transform: uppercase;
			transition:
				background-color var(--duration-fast) var(--ease-out),
				color var(--duration-fast) var(--ease-out);
		}
		a:hover {
			background: rgb(var(--color-accent-rgb) / 0.15);
			color: var(--color-on-dark);
		}
		a.current {
			background: rgb(var(--color-accent-rgb) / 0.22);
			color: var(--color-on-dark);
		}
		/* The icon box dissolves so icon, label and count line up in the pill,
		   with the count after the label. */
		.icon {
			display: contents;
		}
		.icon :global(svg) {
			width: 15px;
			height: 15px;
		}
		.label {
			order: 1;
		}
		.icon :global(.count) {
			order: 2;
		}
	}
	/* Below 1180px the full menu no longer fits beside the wordmark. The four
	   views fall back to their familiar icons (named, with a tooltip); Trails
	   and Fieldbook keep their words, since their icons explain less. */
	@media (min-width: 1024px) and (max-width: 1179px) {
		.views .label {
			display: none;
		}
		.views a {
			min-width: 40px;
			justify-content: center;
			padding: var(--space-1) var(--space-2);
		}
	}
	@media (min-width: 1024px) and (pointer: coarse) {
		ul {
			height: 44px;
		}
	}

	/* ── Phones and tablets: a tab bar along the bottom edge ── */
	@media (max-width: 1023px) {
		.site-nav {
			position: fixed;
			inset: auto 0 0;
			display: flex;
			justify-content: center;
			height: var(--footer-height);
			background: var(--color-header-bg);
			box-shadow: 0 -1px 0 rgb(var(--color-accent-rgb) / 0.15);
		}
		/* The two groups merge into one row of tabs. */
		ul {
			display: contents;
		}
		.item-list {
			display: none;
		}
		/* Five tabs spread to a comfortable thumb span on tablets rather than
		   across the whole width. */
		li {
			flex: 1;
			max-width: 112px;
		}
		a {
			position: relative;
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 3px;
			min-width: 44px;
			color: rgb(var(--color-header-text-rgb) / 0.72);
			font-size: var(--text-xs);
			transition: color var(--duration-fast) var(--ease-out);
			-webkit-tap-highlight-color: transparent;
		}
		/* The current tab: a short gold rule along the bar's top edge, a gold
		   icon and a brighter label. */
		a::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			width: 28px;
			height: 2px;
			border-radius: var(--radius-pill);
			background: var(--color-accent);
			transform: translateX(-50%) scaleX(0);
			transition: transform var(--duration-base) var(--ease-out);
		}
		a.current,
		a.tab-current {
			color: var(--color-on-dark);
		}
		a.current::before,
		a.tab-current::before {
			transform: translateX(-50%) scaleX(1);
		}
		a.current .icon,
		a.tab-current .icon {
			color: var(--color-accent);
		}
		.icon {
			position: relative;
			display: grid;
			place-items: center;
		}
		.icon :global(svg) {
			stroke-width: 1.75;
		}
		a:active .icon {
			transform: scale(0.92);
		}
		/* The count sits on the icon's corner, ringed in the bar's colour. */
		.icon :global(.count) {
			position: absolute;
			top: -6px;
			left: calc(50% + 6px);
			box-shadow: 0 0 0 2px var(--color-header-bg);
		}
	}
	@media (max-width: 1023px) and (hover: hover) {
		a:hover {
			color: var(--color-on-dark);
		}
	}
	/* Phones held sideways: icon beside label in the slimmer bar. */
	@media (max-width: 1023px) and (max-height: 500px) {
		a {
			flex-direction: row;
			gap: var(--space-2);
		}
	}
</style>
