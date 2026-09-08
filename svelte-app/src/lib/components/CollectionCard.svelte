<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { ImageOff, Images, MapPin } from '@lucide/svelte';
	import type { Entry } from '$lib/utils/collection';
	import {
		entryTitle,
		entryKey,
		entryKind,
		entryImages,
		coverImage,
		mediaId
	} from '$lib/utils/collection';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import MediaImage from './MediaImage.svelte';
	import { imageDimensions } from '$lib/utils/image';
	import MarkerGlyph from './MarkerGlyph.svelte';
	let { item, priority = false }: { item: Entry; priority?: boolean } = $props();
	const store = getBrowseStore();
	const images = $derived(entryImages(item));
	const cover = $derived(coverImage(item));
	const coverWidth = $derived(
		cover
			? Math.ceil((280 * imageDimensions(cover.src).width) / imageDimensions(cover.src).height)
			: 360
	);
	const href = $derived(store.entryHref(item, { view: 'gallery' }));
	function remember() {
		store.returnKey = entryKey(item);
	}
</script>

<article class="card">
	<a
		class="card-figure"
		{href}
		onclick={remember}
		aria-label="Open album: {item.name}, {images.length} photographs"
		data-entry-key={entryKey(item)}
	>
		{#if cover}<MediaImage
				src={cover.src}
				alt=""
				sizes={`(max-width: 600px) min(90vw, ${coverWidth}px), (max-width: 1000px) min(45vw, ${coverWidth}px), min(290px, ${coverWidth}px)`}
				{priority}
			/>
		{:else}<span class="placeholder"
				><ImageOff size={28} aria-hidden="true" />No photograph available</span
			>{/if}
		{#if images.length > 0}<span class="photo-count"
				><Images size={15} aria-hidden="true" />{images.length}
				{images.length === 1 ? 'photo' : 'photos'}</span
			>{/if}
	</a>
	{#if images.length > 1}
		<div class="card-previews" aria-label="Album preview">
			{#each images.filter((image) => image !== cover).slice(0, 3) as image, i (mediaId(image))}
				<a
					href={store.entryHref(item, { view: 'gallery', photo: mediaId(image) })}
					onclick={remember}
					aria-label="Open photograph: {image.caption || `${item.name}, ${i + 2}`}"
					><MediaImage src={image.src} alt="" sizes="100px" /></a
				>
			{/each}
		</div>
	{/if}
	<div class="card-body">
		<h3 dir="auto">
			<a {href} onclick={remember}>{entryTitle(item)}</a>
		</h3>
		<p class="card-meta" dir="auto">
			<MarkerGlyph
				kind={entryKind(item) === 'residence'
					? 'residence'
					: 'status' in item && item.status === 'search'
						? 'search'
						: 'located'}
				size={12}
			/>{item.city}, {item.country}
		</p>
		{#if 'years' in item}<p class="card-meta">{item.years}</p>{/if}
		{#if 'status' in item && item.status === 'search'}<p class="card-badge">
				To be found · location unconfirmed
			</p>{/if}
		<a class="map-link" href={store.entryHref(item, { view: 'map' })} onclick={remember}
			><MapPin size={14} aria-hidden="true" />View on map</a
		>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.card-figure {
		position: relative;
		display: block;
		height: 280px;
		background: var(--color-surface-image);
		text-decoration: none;
	}
	.photo-count {
		position: absolute;
		bottom: var(--space-2);
		right: var(--space-2);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--color-header-bg);
		color: var(--color-on-dark);
		padding: var(--space-1-5) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
	}
	.placeholder {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: var(--space-3);
		color: var(--color-text-secondary);
	}
	.card-previews {
		display: flex;
		gap: 4px;
		height: 66px;
		padding: 4px;
		background: var(--color-surface-image);
	}
	.card-previews a {
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}
	.card-body {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
	}
	h3 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		line-height: var(--leading-snug);
		overflow-wrap: anywhere;
	}
	h3 a {
		color: var(--color-ink);
		text-decoration: none;
	}
	h3 a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.card-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	.card-badge {
		font-size: var(--text-xs);
		color: var(--color-search-text);
	}
	.map-link {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		min-height: 44px;
		margin-top: auto;
		color: var(--color-primary-text);
		font-size: var(--text-sm);
		text-underline-offset: 3px;
	}
	@media (max-width: 600px) {
		.card-figure {
			height: 280px;
		}
	}
</style>
