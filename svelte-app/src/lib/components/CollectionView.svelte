<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';
	import { entryKey, entryTitle, entryImages, mediaId, imageAlt } from '$lib/utils/collection';
	import { imageDimensions } from '$lib/utils/image';
	import CollectionCard from './CollectionCard.svelte';
	import MediaImage from './MediaImage.svelte';
	const store = getBrowseStore();
	const items = $derived([
		...filterArtworks(artworks, store.filters),
		...filterResidences(residences, store.filters)
	]);
	const photoCount = $derived(items.reduce((count, item) => count + entryImages(item).length, 0));
</script>

<div class="collection-page" data-testid="collection-scroll">
	<div class="collection-inner">
		<header class="collection-head">
			<div>
				<h2>{store.mode === 'list' ? 'Collection index' : 'The collection'}</h2>
				<p class="page-count" role="status">
					{items.length}
					{items.length === 1 ? 'entry' : 'entries'} · {photoCount} photographs
				</p>
			</div>
			{#if store.mode !== 'list'}<div
					class="gallery-modes"
					role="group"
					aria-label="Gallery display"
				>
					<button
						disabled={!store.ready}
						aria-pressed={store.mode === 'entries'}
						onclick={() => store.setMode('entries')}>Entries</button
					><button
						disabled={!store.ready}
						aria-pressed={store.mode === 'photos'}
						onclick={() => store.setMode('photos')}>Photos</button
					>
				</div>{/if}
		</header>
		{#if !items.length}<div class="empty">
				<h3>No entries match these filters</h3>
				<p>Try another country, status or search term.</p>
				<button disabled={!store.ready} onclick={() => store.resetFilters()}>Clear filters</button>
			</div>{/if}
		{#if store.mode === 'entries'}
			<ul class="entry-grid">
				{#each items as item, i (entryKey(item))}<li>
						<CollectionCard {item} priority={i === 0} />
					</li>{/each}
			</ul>
		{:else if store.mode === 'list'}
			<ul class="entry-list">
				{#each items as item (entryKey(item))}<li>
						<a
							href={store.entryHref(item, { view: 'gallery' })}
							data-entry-key={entryKey(item)}
							onclick={() => (store.returnKey = entryKey(item))}
							><span class="list-title" dir="auto">{entryTitle(item)}</span><span dir="auto"
								>{item.city}, {item.country}</span
							><span>{entryImages(item).length} photos</span><span
								>{'status' in item
									? item.status === 'search'
										? 'To be found'
										: 'Located'
									: 'Residence'}</span
							></a
						>
					</li>{/each}
			</ul>
		{:else}
			<p class="photos-intro">Photographs grouped by entry. Open any image to explore its album.</p>
			{#each items as item (entryKey(item))}
				<section class="photo-group" aria-label={item.name}>
					<h3>
						<a
							href={store.entryHref(item, { view: 'gallery' })}
							data-entry-key={entryKey(item)}
							onclick={() => (store.returnKey = entryKey(item))}
							dir="auto">{entryTitle(item)}</a
						><span>{entryImages(item).length} photos</span>
					</h3>
					{#if entryImages(item).length}<div class="photo-grid">
							{#each entryImages(item) as photo (mediaId(photo))}
								<figure>
									<a
										href={store.entryHref(item, { view: 'gallery', photo: mediaId(photo) })}
										onclick={() => (store.returnKey = entryKey(item))}
										aria-label="Open photograph: {photo.caption || item.name}"
										style:aspect-ratio={`${imageDimensions(photo.src).width} / ${imageDimensions(photo.src).height}`}
										><MediaImage
											src={photo.src}
											alt={imageAlt(photo, item.name)}
											sizes="(max-width:600px) 90vw, 320px"
										/></a
									>
									{#if photo.caption}<figcaption>{photo.caption}</figcaption>{/if}
								</figure>
							{/each}
						</div>{:else}<p>
							No photographs available. The entry remains available in the collection.
						</p>{/if}
				</section>
			{/each}
		{/if}
	</div>
</div>

<style>
	.collection-page {
		position: fixed;
		inset: calc(var(--header-height) + var(--filter-height)) 0 var(--footer-height);
		overflow: auto;
		background: var(--color-surface-warm);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	.collection-inner {
		max-width: 1280px;
		margin: auto;
		padding: var(--space-6) var(--space-7) var(--space-8);
	}
	.collection-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}
	h2 {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		color: var(--color-ink);
		line-height: var(--leading-tight);
	}
	.page-count,
	.photos-intro {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-top: var(--space-2);
	}
	.gallery-modes {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		padding: 3px;
	}
	button {
		min-height: 44px;
		border: 0;
		border-radius: var(--radius-pill);
		padding: var(--space-2) var(--space-4);
		font: inherit;
		cursor: pointer;
		color: var(--color-text-secondary);
		background: var(--color-surface);
	}
	button[aria-pressed='true'] {
		color: var(--color-on-dark);
		background: var(--color-header-bg);
	}
	.entry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-5);
		list-style: none;
	}
	.entry-grid li {
		min-width: 0;
	}
	.entry-list {
		list-style: none;
		border-top: 1px solid var(--color-border);
	}
	.entry-list a {
		display: grid;
		grid-template-columns: 2fr 1.4fr 0.6fr 0.7fr;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--color-border);
		align-items: center;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}
	.list-title {
		font: var(--weight-semibold) var(--text-xl) var(--font-display);
		color: var(--color-ink);
	}
	.entry-list a:hover .list-title {
		text-decoration: underline;
	}
	.photo-group {
		padding: var(--space-6) 0;
		border-bottom: 1px solid var(--color-border);
	}
	h3 {
		font: var(--weight-semibold) var(--text-2xl) var(--font-display);
		margin-bottom: var(--space-4);
	}
	h3 a {
		color: var(--color-ink);
		text-underline-offset: 4px;
	}
	h3 span {
		display: block;
		font: var(--text-sm) var(--font-body);
		color: var(--color-text-secondary);
		margin-top: var(--space-2);
	}
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: var(--space-4);
		align-items: start;
	}
	figure {
		min-width: 0;
	}
	figure a {
		display: block;
		max-height: 340px;
	}
	figcaption {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		padding-top: var(--space-2);
	}
	.empty {
		padding: var(--space-8) 0;
	}
	.empty p {
		margin-bottom: var(--space-4);
	}
	@media (max-width: 600px) {
		.collection-inner {
			padding: var(--space-4);
		}
		.collection-head {
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: var(--space-4);
		}
		h2 {
			font-size: var(--text-3xl);
		}
		.entry-grid {
			grid-template-columns: 1fr;
		}
		.entry-list a {
			grid-template-columns: 1fr auto;
			gap: var(--space-2);
		}
		.list-title {
			grid-column: 1/-1;
		}
		.photo-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
		figcaption {
			font-size: var(--text-xs);
		}
	}
</style>
