<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { countLabel } from '$lib/utils/text';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { lazyPeople } from '$lib/data/people-lazy.svelte';
	import { filterPeople } from '$lib/utils/people';
	import PeopleList from './PeopleList.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';
	import {
		entryKey,
		entryStatus,
		entryTitle,
		entryImages,
		mediaId,
		imageAlt,
		STATUS_LABELS
	} from '$lib/utils/collection';
	import { imageDimensions } from '$lib/utils/image';
	import CollectionTools from './CollectionTools.svelte';
	import CollectionCard from './CollectionCard.svelte';
	import MediaImage from './MediaImage.svelte';
	import { Images, MapPin } from '@lucide/svelte';
	const store = getBrowseStore();
	const items = $derived([
		...filterArtworks(artworks, store.filters),
		...filterResidences(residences, store.filters)
	]);
	const photoCount = $derived(items.reduce((count, item) => count + entryImages(item).length, 0));
	const wantsPeople = $derived(
		!store.peopleView && (store.filters.query.trim() !== '' || store.filters.type === 'person')
	);
	$effect(() => {
		if (wantsPeople) lazyPeople.load();
	});
	const peopleMatches = $derived(
		wantsPeople && lazyPeople.current ? filterPeople(lazyPeople.current, store.filters) : []
	);
	// Hold the empty state until the profiles have been searched too.
	const peoplePending = $derived(wantsPeople && !lazyPeople.current);
</script>

<div class="collection-page" data-testid="collection-scroll">
	<!-- Hydrate the shared Lucide artwork once for all cards. -->
	<svg class="card-icons" aria-hidden="true" focusable="false">
		<defs>
			<symbol id="collection-images" viewBox="0 0 24 24"><Images /></symbol>
			<symbol id="collection-map-pin" viewBox="0 0 24 24"><MapPin /></symbol>
		</defs>
	</svg>
	<div class="collection-inner">
		<header class="collection-head">
			<div>
				<h2>{store.mode === 'list' ? 'Collection index' : 'The collection'}</h2>
				<p class="page-count" role="status">
					{countLabel(items.length, 'entry', 'entries')} · {countLabel(photoCount, 'photograph')}
					{#if peopleMatches.length}
						· {countLabel(peopleMatches.length, 'profile')}{/if}
				</p>
			</div>
			<div class="gallery-modes" role="group" aria-label="Gallery display">
				<button
					disabled={!store.ready}
					aria-pressed={store.mode === 'entries'}
					onclick={() => store.setMode('entries')}>Entries</button
				><button
					disabled={!store.ready}
					aria-pressed={store.mode === 'photos'}
					onclick={() => store.setMode('photos')}>Photos</button
				>
				<button
					disabled={!store.ready}
					aria-pressed={store.mode === 'list'}
					onclick={() => store.setMode('list')}>List</button
				>
			</div>
		</header>
		<CollectionTools {items} />
		{#if peopleMatches.length}<section class="people-results" aria-label="People results">
				<h3>People</h3>
				<PeopleList items={peopleMatches} />
			</section>{/if}
		{#if !items.length && !peopleMatches.length && !peoplePending}<div class="empty">
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
							><span>{countLabel(entryImages(item).length, 'photo')}</span><span
								>{STATUS_LABELS[entryStatus(item)]}</span
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
						><span>{countLabel(entryImages(item).length, 'photo')}</span>
					</h3>
					{#if entryImages(item).length}<div class="photo-grid">
							{#each entryImages(item) as photo (mediaId(photo))}
								{@const size = imageDimensions(photo.src)}
								<figure style:--ratio={(size.width / size.height).toFixed(4)}>
									<a
										href={store.entryHref(item, { view: 'gallery', photo: mediaId(photo) })}
										onclick={() => (store.returnKey = entryKey(item))}
										aria-label="Open photograph: {photo.caption || item.name}"
										style:aspect-ratio={`${size.width} / ${size.height}`}
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
	.people-results {
		margin-block: var(--space-5) var(--space-7);
	}
	.card-icons {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}
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
		/* Keep every album searchable and focusable while skipping off-screen layout.
		   Once rendered, auto remembers the real height for return navigation. */
		content-visibility: auto;
		contain-intrinsic-block-size: auto 500px;
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
	/* Justified rows: each photo's flex share is its aspect ratio, so the photos
	   in a row share one height and none is cropped. The spacer keeps the last
	   row at its natural size instead of stretching a lone portrait. */
	.photo-grid {
		--row-height: 190px;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: flex-start;
	}
	.photo-grid::after {
		content: '';
		flex-grow: 1000;
	}
	figure {
		min-width: 0;
		flex: var(--ratio) 1 calc(var(--ratio) * var(--row-height));
	}
	figure a {
		display: block;
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
			--row-height: 120px;
			gap: var(--space-3);
		}
		figcaption {
			font-size: var(--text-xs);
		}
	}
</style>
