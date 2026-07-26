<script lang="ts">
	import { ImageOff } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import MarkerGlyph from '$lib/components/MarkerGlyph.svelte';
	import ViewSwitcher from '$lib/components/ViewSwitcher.svelte';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { srcSet, thumbUrl, webUrl } from '$lib/utils/image';
	import { hideOnError } from '$lib/utils/hide-on-error';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';

	/**
	 * The collection as photographs rather than coordinates.
	 *
	 * The map is a poor overview of this particular body of work: 26 of the 39
	 * artworks are in Egypt, most of those in Cairo districts, so at world zoom
	 * almost everything is a single dot. A grid shows the whole collection at
	 * once — which for an artist's catalogue is the more natural reading — and
	 * puts the 139 photographs to use.
	 *
	 * Prerendered like every other route, so it is crawlable and shareable, and
	 * it honours the filter bar exactly as the map does.
	 */

	const store = getMapStore();

	// Arriving from an artwork page leaves the sidebar open over the grid.
	$effect(() => {
		store.selectedArtwork = null;
		store.selectedResidence = null;
	});

	const visibleArtworks = $derived(filterArtworks(artworks, store.activeFilter));
	const visibleResidences = $derived(filterResidences(residences, store.activeFilter));
	const total = $derived(visibleArtworks.length + visibleResidences.length);

	/** Lead photo for a card — `images[0]` wins over the legacy single `image`. */
	function lead(item: { images?: { src: string }[]; image?: string }): string | undefined {
		return item.images?.[0]?.src ?? item.image;
	}
</script>

<Seo
	title="The collection — Global Heshmat"
	description="Browse every located and still-missing public artwork by the Egyptian sculptor Hassan Heshmat (1920–2006), and the places where he lived and worked."
	path="/collection/"
/>

<div class="collection-page">
	<div class="collection-page-inner">
		<header class="page-head">
			<div>
				<h1>The collection</h1>
				<p class="page-count">
					{total}
					{total === 1 ? 'entry' : 'entries'}{store.activeFilter !== 'all' ? ' in this filter' : ''}
				</p>
			</div>
			<ViewSwitcher />
		</header>

		{#if total === 0}
			<p class="page-empty">No entries match the current filter.</p>
		{/if}

		{#if visibleArtworks.length > 0}
			<ul class="grid">
				{#each visibleArtworks as artwork (artwork.id)}
					{@const src = lead(artwork)}
					<li>
						<a class="card" href={resolve('/artworks/[slug]', { slug: artwork.slug })}>
							<div class="card-figure">
								{#if src}
									<img
										src={webUrl(src)}
										srcset={srcSet(src)}
										sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 260px"
										alt=""
										loading="lazy"
										decoding="async"
										use:hideOnError
									/>
								{:else}
									<div class="card-placeholder">
										<ImageOff size={28} strokeWidth={1.6} aria-hidden="true" />
										<span>Image coming soon</span>
									</div>
								{/if}
							</div>
							<div class="card-body">
								<h2 dir="auto">{artwork.name}</h2>
								<p class="card-meta" dir="auto">
									<MarkerGlyph
										kind={artwork.status === 'search' ? 'search' : 'located'}
										size={10}
									/>
									{artwork.city}, {artwork.country}
								</p>
								{#if artwork.status === 'search'}
									<p class="card-badge">To be found</p>
								{/if}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}

		{#if visibleResidences.length > 0}
			<h2 class="section-head">Places of residence</h2>
			<ul class="grid">
				{#each visibleResidences as residence (residence.id)}
					{@const src = lead(residence)}
					<li>
						<a class="card" href={resolve('/residences/[slug]', { slug: residence.slug })}>
							<div class="card-figure">
								{#if src}
									<img
										src={thumbUrl(src)}
										srcset={srcSet(src)}
										sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 260px"
										alt=""
										loading="lazy"
										decoding="async"
										use:hideOnError
									/>
								{:else}
									<div class="card-placeholder">
										<ImageOff size={28} strokeWidth={1.6} aria-hidden="true" />
										<span>Image coming soon</span>
									</div>
								{/if}
							</div>
							<div class="card-body">
								<h3 dir="auto">{residence.name}</h3>
								<p class="card-meta" dir="auto">
									<MarkerGlyph kind="residence" size={10} />
									{residence.city}, {residence.country}
								</p>
								{#if residence.years}<p class="card-years">{residence.years}</p>{/if}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	/* Covers the map area. The map stays mounted underneath — it is already
	   loaded, and keeping it avoids tearing down and rebuilding a WebGL context
	   every time the visitor switches view. */
	.collection-page {
		position: fixed;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		z-index: var(--z-page);
		overflow-y: auto;
		background: var(--color-surface-warm);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	.collection-page-inner {
		max-width: 1240px;
		margin: 0 auto;
		padding: var(--space-7) var(--space-7) var(--space-8);
	}

	.page-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}
	.page-head h1 {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		line-height: var(--leading-tight);
	}
	.page-head h1::after {
		content: '';
		display: block;
		width: 40px;
		height: 2px;
		background: var(--color-accent);
		margin-top: var(--space-2);
		border-radius: 1px;
	}
	.page-count {
		margin-top: var(--space-2-5);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
	.page-empty {
		padding: var(--space-8) 0;
		text-align: center;
		font-style: italic;
		color: var(--color-text-muted);
	}
	.section-head {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		margin: var(--space-8) 0 var(--space-5);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border);
	}

	/* auto-fill rather than auto-fit: a filter that leaves one result keeps a
	   card-sized card instead of stretching it across the whole row. */
	.grid {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
		gap: var(--space-5);
	}

	.card {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-base) var(--ease-out),
			box-shadow var(--duration-base) var(--ease-out),
			border-color var(--duration-base) var(--ease-out);
	}
	.card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-accent);
	}

	.card-figure {
		aspect-ratio: 4 / 3;
		background: var(--color-surface-image);
		overflow: hidden;
	}
	.card-figure img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform var(--duration-slower) var(--ease-out);
	}
	.card:hover .card-figure img {
		transform: scale(1.04);
	}
	.card-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		color: var(--color-text-placeholder);
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-sm);
		text-align: center;
		padding: var(--space-3);
	}

	.card-body {
		padding: var(--space-3-5) var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		flex: 1;
	}
	.card-body h2,
	.card-body h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-snug);
		color: var(--color-ink);
	}
	.card-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.card-years {
		font-size: var(--text-xs);
		font-style: italic;
		color: var(--color-text-muted);
	}
	.card-badge {
		align-self: flex-start;
		margin-top: auto;
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-search-light);
		color: var(--color-search-text);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}

	@media (prefers-reduced-motion: reduce) {
		.card:hover {
			transform: none;
		}
		.card:hover .card-figure img {
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.collection-page-inner {
			padding: var(--space-5) var(--space-4) var(--space-7);
		}
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: var(--space-3-5);
		}
		.page-head h1 {
			font-size: var(--text-3xl);
		}
	}
</style>
