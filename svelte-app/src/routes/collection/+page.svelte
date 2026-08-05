<script lang="ts">
	import { resolve } from '$app/paths';
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { leadImage } from '$lib/utils/image';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';

	const store = getMapStore();

	$effect(() => {
		store.selectedArtwork = null;
		store.selectedResidence = null;
	});

	const visibleArtworks = $derived(filterArtworks(artworks, store.activeFilter));
	const visibleResidences = $derived(filterResidences(residences, store.activeFilter));
	const total = $derived(visibleArtworks.length + visibleResidences.length);
</script>

<Seo
	title="The collection — Global Heshmat"
	description="Browse every located and still-missing public artwork by the Egyptian sculptor Hassan Heshmat (1920–2006), and the places where he lived and worked."
	path="/collection/"
/>

<div class="collection-page">
	<div class="collection-page-inner">
		<!-- The view switcher lives in the site header, which sits directly above
		     this heading; repeating it here would stack two identical controls. -->
		<header class="page-head">
			<h2>The collection</h2>
			<p class="page-count">
				{total}
				{total === 1 ? 'entry' : 'entries'}{store.activeFilter !== 'all' ? ' in this filter' : ''}
			</p>
		</header>

		{#if total === 0}
			<p class="page-empty">No entries match the current filter.</p>
		{/if}

		{#if visibleArtworks.length > 0}
			<h3 class="section-head section-head-first">Artworks</h3>
			<ul class="grid">
				{#each visibleArtworks as artwork, index (artwork.id)}
					<li>
						<CollectionCard
							href={resolve('/artworks/[slug]', { slug: artwork.slug })}
							name={artwork.name}
							city={artwork.city}
							country={artwork.country}
							image={leadImage(artwork)}
							markerKind={artwork.status === 'search' ? 'search' : 'located'}
							badge={artwork.status === 'search' ? 'To be found' : undefined}
							priority={index < 8}
						/>
					</li>
				{/each}
			</ul>
		{/if}

		{#if visibleResidences.length > 0}
			<h3 class="section-head">Places of residence</h3>
			<ul class="grid">
				{#each visibleResidences as residence (residence.id)}
					<li>
						<CollectionCard
							href={resolve('/residences/[slug]', { slug: residence.slug })}
							name={residence.name}
							city={residence.city}
							country={residence.country}
							image={leadImage(residence)}
							markerKind="residence"
							detail={residence.years}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
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
		margin-bottom: var(--space-6);
	}
	.page-head h2 {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		line-height: var(--leading-tight);
	}
	.page-head h2::after {
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
	.section-head-first {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
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
	.grid {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
		gap: var(--space-5);
	}
	.grid li {
		min-width: 0;
	}
	@media (max-width: 768px) {
		.collection-page-inner {
			padding: var(--space-5) var(--space-4) var(--space-7);
		}
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: var(--space-3-5);
		}
		.page-head h2 {
			font-size: var(--text-3xl);
		}
	}
</style>
