<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { countLabel } from '$lib/utils/text';
	import MediaImage from '$lib/components/MediaImage.svelte';
	import { imageDimensions } from '$lib/utils/image';
	import { artworks } from '$lib/data/artworks';
	import { aboutContent } from '$lib/data/about';
	import { filterArtworks } from '$lib/utils/map-filter';
	import { entryKey, entryTitle, entryImages, coverImage } from '$lib/utils/collection';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	const store = getBrowseStore();
	const missing = $derived(filterArtworks(artworks, { ...store.filters, status: 'search' }));
	const total = artworks.filter((item) => item.status === 'search').length;
</script>

<div class="missing-page">
	<div class="missing-inner">
		<header>
			<h2>Works still to be found</h2>
			<p class="intro">
				The current locations of {total} entries remain unconfirmed. These photographs and records are
				starting points for further research. A marker on the map indicates a recorded place, not a confirmed
				present-day location.
			</p>
			<p class="missing-count" role="status">{missing.length} of {total} entries shown</p>
		</header>
		{#if !missing.length}<p>No missing works match these filters.</p>
			<button onclick={() => store.resetFilters()}>Clear filters</button>{/if}
		{#each missing as artwork, i (artwork.id)}
			{@const image = coverImage(artwork)}
			{@const ratio = image
				? imageDimensions(image.src).width / imageDimensions(image.src).height
				: 1}
			<article class="missing-entry" data-entry-key={entryKey(artwork)} tabindex="-1">
				<div class="document">
					{#if image}<a
							href={store.entryHref(artwork, { view: 'gallery', origin: 'missing' })}
							aria-label="Open album: {artwork.name}"
							onclick={() => (store.returnKey = entryKey(artwork))}
							><MediaImage
								src={image.src}
								alt={image.alt || image.caption || artwork.name}
								sizes={`(max-width:768px) min(90vw, ${Math.ceil(320 * ratio)}px), min(380px, ${Math.ceil(360 * ratio)}px)`}
								priority={i === 0}
							/></a
						>{#if image.caption}<p class="caption">{image.caption}</p>{/if}
					{:else}<p class="no-image">No photograph available in this entry.</p>{/if}
				</div>
				<div class="record">
					<h3 dir="auto">{entryTitle(artwork)}</h3>
					<p class="place" dir="auto">Recorded place: {artwork.city}, {artwork.country}</p>
					<p class="uncertain">Current location unconfirmed</p>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- repository-owned editorial text -->
					<div class="description" dir="auto">{@html artwork.desc}</div>
					<div class="record-actions">
						<a
							href={store.entryHref(artwork, { view: 'gallery', origin: 'missing' })}
							onclick={() => (store.returnKey = entryKey(artwork))}
							>View entry{entryImages(artwork).length
								? ` · ${countLabel(entryImages(artwork).length, 'photo')}`
								: ''}</a
						><a href={store.entryHref(artwork, { view: 'map', origin: 'missing' })}
							>Recorded place on map</a
						>
					</div>
					<div class="contribute">
						<h4>Do you have information?</h4>
						<p>
							A place, a dated photograph, a document or a reference could help. Please include when
							and where it was recorded and the source.
						</p>
						<a
							href={`mailto:${aboutContent.contactEmail}?subject=${encodeURIComponent(`Global Heshmat — information about ${artwork.name} (artwork ${artwork.id})`)}&body=${encodeURIComponent(`Entry: ${artwork.name}\nReference: artwork ${artwork.id}\n\nPlace and date:\n\nInformation and source:\n`)}`}
							>Contact the research team</a
						>
					</div>
				</div>
			</article>
		{/each}
	</div>
</div>

<style>
	.missing-page {
		position: fixed;
		inset: calc(var(--header-height) + var(--filter-height)) 0 var(--footer-height);
		overflow: auto;
		background: var(--color-surface-warm);
		scrollbar-width: thin;
	}
	.missing-inner {
		max-width: 1140px;
		margin: auto;
		padding: var(--space-6) var(--space-7);
	}
	h2 {
		font: var(--weight-semibold) var(--text-4xl) var(--font-display);
		color: var(--color-ink);
	}
	.intro {
		max-width: 72ch;
		line-height: var(--leading-relaxed);
		margin-top: var(--space-3);
		color: var(--color-text-secondary);
	}
	.missing-count {
		margin-top: var(--space-3);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	.missing-entry {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
		gap: var(--space-7);
		padding: var(--space-7) 0;
		border-top: 1px solid var(--color-border);
		margin-top: var(--space-7);
	}
	.document a {
		display: block;
		height: 360px;
	}
	.caption,
	.place {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-top: var(--space-2);
	}
	.no-image {
		padding: var(--space-7);
		background: var(--color-surface-image);
		color: var(--color-text-secondary);
	}
	h3 {
		font: var(--weight-semibold) var(--text-3xl) var(--font-display);
		color: var(--color-ink);
		overflow-wrap: anywhere;
	}
	.uncertain {
		color: var(--color-search-text);
		font-size: var(--text-sm);
		margin: var(--space-2) 0 var(--space-4);
	}
	.description,
	.contribute p {
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}
	.record-actions {
		display: flex;
		gap: var(--space-4);
		flex-wrap: wrap;
		margin-top: var(--space-3);
	}
	a {
		color: var(--color-primary-text);
		text-underline-offset: 3px;
	}
	.record-actions a,
	.contribute a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.contribute {
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}
	h4 {
		margin-bottom: var(--space-2);
	}
	@media (max-width: 768px) {
		.missing-inner {
			padding: var(--space-4);
		}
		.missing-entry {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}
		h2 {
			font-size: var(--text-3xl);
		}
		.document a {
			height: 320px;
		}
	}
</style>
