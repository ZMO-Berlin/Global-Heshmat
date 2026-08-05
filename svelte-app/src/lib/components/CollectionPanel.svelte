<script lang="ts">
	import { MapPin, Search as SearchIcon, X } from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { artworkPath, residencePath } from '$lib/config';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';
	import MarkerGlyph from './MarkerGlyph.svelte';

	/**
	 * A text index of everything on the map.
	 *
	 * The map is a WebGL canvas: its markers can't take focus and expose no
	 * accessible name, so without this panel the only route into the collection
	 * is the search box — which requires already knowing what to search for.
	 * This gives keyboard and screen-reader visitors somewhere to browse, and
	 * gives sighted visitors a list view of a map that is mostly empty ocean.
	 *
	 * It is also the site's only internal linking. The panel's markup is always
	 * rendered (hidden with a transform, not `{#if}`), so every prerendered page
	 * ships real <a href> links to all 39 artworks and 4 residences. Before this,
	 * the home page's entire link graph was four ZMO credits in the footer, and
	 * crawlers could only reach artwork pages through sitemap.xml.
	 *
	 * Entries follow the active filter, so the list and the map always agree.
	 */

	const store = getMapStore();

	const visibleArtworks = $derived(filterArtworks(artworks, store.activeFilter));
	const visibleResidences = $derived(filterResidences(residences, store.activeFilter));

	/** Artworks grouped by country, both levels alphabetical. */
	const grouped = $derived.by(() =>
		[...new Set(visibleArtworks.map((a) => a.country))]
			.sort((x, y) => x.localeCompare(y, 'en'))
			.map((country) => ({
				country,
				items: visibleArtworks
					.filter((a) => a.country === country)
					.sort((x, y) => x.name.localeCompare(y.name, 'en'))
			}))
	);

	const total = $derived(visibleArtworks.length + visibleResidences.length);
	const titleId = $props.id();

	// Focus moves into the panel when it opens and back to whatever opened it
	// when it closes. Without this the skip link would "skip" to a region the
	// caret never reaches, and closing would strand focus on a hidden element.
	let panelEl: HTMLElement | undefined = $state();
	let opener: HTMLElement | null = null;

	$effect(() => {
		if (store.browseOpen) {
			opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			// Deferred until after `inert` is removed, or the focus is refused.
			requestAnimationFrame(() => panelEl?.focus());
		} else if (opener) {
			opener.focus();
			opener = null;
		}
	});

	/** Dismiss the panel and hand focus back to whatever opened it. */
	function close() {
		store.browseOpen = false;
	}

	/**
	 * Dismiss because the visitor followed an entry. Focus belongs to the
	 * destination — the sidebar moves it to the item's heading — so drop the
	 * opener rather than yanking focus back up to the header button.
	 */
	function closeForNavigation() {
		opener = null;
		store.browseOpen = false;
	}

	/** The entry for the item currently open in the sidebar, if any. */
	const currentPath = $derived(page.url.pathname);
</script>

<!-- `inert` when closed keeps the off-screen links out of the tab order and the
     accessibility tree, while leaving them in the HTML for crawlers. -->
<section
	id="collection"
	class="collection"
	class:open={store.browseOpen}
	aria-labelledby={titleId}
	inert={!store.browseOpen}
	tabindex="-1"
	bind:this={panelEl}
>
	<div class="collection-header">
		<h2 id={titleId}>
			Browse the collection
			<span class="collection-count">{total} {total === 1 ? 'entry' : 'entries'}</span>
		</h2>
		<button class="btn-close" onclick={close} aria-label="Close the collection list">
			<X size={20} strokeWidth={2.25} />
		</button>
	</div>

	<!-- No view switcher here: the header carries the only one, and it stays
	     visible above this panel (z-index 50 vs 30), so a copy would just be a
	     second identical control a few pixels below the first. -->

	<div class="collection-body">
		{#if total === 0}
			<p class="collection-empty">No entries match the current filter.</p>
		{/if}

		{#each grouped as group (group.country)}
			<h3 class="collection-group">{group.country}</h3>
			<ul class="collection-list">
				{#each group.items as artwork (artwork.id)}
					{@const href = resolve('/artworks/[slug]', { slug: artwork.slug })}
					<li>
						<a
							{href}
							class="collection-item"
							class:current={currentPath === artworkPath(artwork.slug)}
							aria-current={currentPath === artworkPath(artwork.slug) ? 'page' : undefined}
							onclick={closeForNavigation}
						>
							<MarkerGlyph kind={artwork.status === 'search' ? 'search' : 'located'} size={11} />
							<span class="collection-name" dir="auto">{artwork.name}</span>
							<span class="collection-city" dir="auto">
								{artwork.city}
								{#if artwork.status === 'search'}
									<span class="collection-badge">
										<SearchIcon size={11} strokeWidth={2.5} /> To be found
									</span>
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/each}

		{#if visibleResidences.length > 0}
			<h3 class="collection-group">Places of residence</h3>
			<ul class="collection-list">
				{#each visibleResidences as residence (residence.id)}
					{@const href = resolve('/residences/[slug]', { slug: residence.slug })}
					<li>
						<a
							{href}
							class="collection-item"
							class:current={currentPath === residencePath(residence.slug)}
							aria-current={currentPath === residencePath(residence.slug) ? 'page' : undefined}
							onclick={closeForNavigation}
						>
							<MarkerGlyph kind="residence" size={11} />
							<span class="collection-name" dir="auto">{residence.name}</span>
							<span class="collection-city" dir="auto">
								<MapPin size={11} strokeWidth={2.5} />
								{residence.city}, {residence.country}
								{#if residence.years}&middot; {residence.years}{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.collection {
		position: fixed;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		width: 380px;
		max-width: 100%;
		z-index: var(--z-sidebar);
		background: var(--color-surface);
		box-shadow: 6px 0 32px rgb(var(--color-header-bg-rgb) / 0.1);
		display: flex;
		flex-direction: column;
		transform: translateX(-100%);
		transition: transform var(--duration-slower) var(--ease-out);
	}
	.collection.open {
		transform: translateX(0);
	}

	.collection-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-5) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}
	.collection-header h2 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		line-height: var(--leading-tight);
	}
	.collection-count {
		display: block;
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	.collection-body {
		overflow-y: auto;
		flex: 1;
		padding-bottom: var(--space-5);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	.collection-empty {
		padding: var(--space-6) var(--space-5);
		font-size: var(--text-base);
		font-style: italic;
		color: var(--color-text-muted);
	}

	/* Country heading — sticky so the group stays identifiable while scrolling
	   a long list. */
	.collection-group {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--color-surface-warm);
		border-bottom: 1px solid var(--color-border-light);
		padding: var(--space-2) var(--space-5);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.collection-list {
		list-style: none;
	}
	.collection-item {
		display: grid;
		min-height: 44px;
		grid-template-columns: auto 1fr;
		gap: 0 var(--space-2-5);
		padding: var(--space-2-5) var(--space-5);
		text-decoration: none;
		color: inherit;
		border-bottom: 1px solid var(--color-border-light);
		transition: background var(--duration-fast) var(--ease-out);
	}
	.collection-item:hover {
		background: var(--color-surface-warm);
	}
	.collection-item.current {
		background: var(--color-primary-light);
		box-shadow: inset 3px 0 0 var(--color-primary-text);
	}
	.collection-name {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		color: var(--color-ink);
		line-height: var(--leading-snug);
	}
	.collection-city {
		grid-column: 2;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-top: 2px;
	}
	.collection-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: var(--color-search-text);
		font-weight: var(--weight-medium);
	}

	/* The glyph is the same shape the map draws — see MarkerGlyph.svelte. */
	.collection-item :global(.glyph) {
		margin-top: 4px;
	}

	@media (max-width: 768px) {
		.collection {
			width: 100%;
		}
	}
</style>
