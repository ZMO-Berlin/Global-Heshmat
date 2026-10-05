<script lang="ts">
	import { Maximize2, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import type { ArtworkImage } from '$lib/data/types';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { mediaId, imageAlt, matchesMediaId } from '$lib/utils/collection';
	import MediaImage from './MediaImage.svelte';
	import MediaCaption from './MediaCaption.svelte';
	import ImageComparison from './ImageComparison.svelte';
	import Lightbox from './Lightbox.svelte';
	let {
		images,
		name,
		sizes = '(max-width: 768px) 100vw, 60vw'
	}: { images: ArtworkImage[]; name: string; sizes?: string } = $props();
	const store = getBrowseStore();
	let current = $state(0);
	const selected = $derived(images[current] ?? images[0]);
	const lightboxOpen = $derived(images.some((image) => matchesMediaId(image, store.photo)));
	$effect(() => {
		const index = images.findIndex((image) => matchesMediaId(image, store.photo));
		if (index >= 0) current = index;
		else if (current >= images.length) current = 0;
	});
	function step(direction: number) {
		current = (current + direction + images.length) % images.length;
	}
</script>

{#if selected}
	<section class="gallery" aria-label="Photographs of {name}" id="album">
		<div class="gallery-stage">
			<button
				disabled={!store.ready}
				class="gallery-open"
				type="button"
				onclick={(event) => {
					// WebKit does not focus buttons on pointer clicks. Give the dialog
					// a consistent return target for both mouse and keyboard activation.
					event.currentTarget.focus({ preventScroll: true });
					store.setPhoto(mediaId(selected), true);
				}}
				aria-label="View image full screen"
			>
				<MediaImage src={selected.src} alt={imageAlt(selected, name)} size="web" {sizes} priority />
				<span class="expand"><Maximize2 size={18} aria-hidden="true" /> Full screen</span>
			</button>
		</div>
		<div class="gallery-caption" aria-live="polite">
			<MediaCaption image={selected} fallback={name} />
			<div class="gallery-controls">
				{#if images.length > 1}<button
						disabled={!store.ready}
						onclick={() => step(-1)}
						aria-label="Previous image"><ChevronLeft size={20} /></button
					>{/if}
				<span class="gallery-counter">{current + 1} / {images.length}</span>
				{#if images.length > 1}<button
						disabled={!store.ready}
						onclick={() => step(1)}
						aria-label="Next image"><ChevronRight size={20} /></button
					>{/if}
			</div>
		</div>
		{#if images.length > 1}
			<h3>All {images.length} photographs</h3>
			<div class="gallery-thumbs">
				{#each images as img, i (mediaId(img))}
					<button
						disabled={!store.ready}
						class="gallery-thumb"
						class:active={i === current}
						aria-pressed={i === current}
						aria-label="Show image {i + 1} of {images.length}: {img.caption || name}"
						onclick={() => (current = i)}
					>
						<MediaImage src={img.src} alt="" sizes="120px" />
					</button>
				{/each}
			</div>
		{/if}
		{#if images.length > 1}<ImageComparison {images} {name} />{/if}
	</section>
	{#if lightboxOpen}<Lightbox
			{images}
			{name}
			bind:current
			onclose={() => store.setPhoto(null)}
			onchange={(index) => store.setPhoto(mediaId(images[index]))}
		/>{/if}
{/if}

<style>
	.gallery {
		min-width: 0;
		scroll-margin-top: var(--space-4);
	}
	.gallery-stage {
		height: clamp(220px, 49vh, 640px);
		background: var(--color-surface-image);
	}
	.gallery-open {
		position: relative;
		width: 100%;
		height: 100%;
		display: block;
		border: 0;
		background: none;
		cursor: zoom-in;
	}
	.expand {
		position: absolute;
		right: var(--space-3);
		bottom: var(--space-3);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		background: var(--color-header-bg);
		color: var(--color-on-dark);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}
	.gallery-caption {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--gallery-content-inset, 0px);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}
	.gallery-controls {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: var(--space-1);
		font-variant-numeric: tabular-nums;
	}
	.gallery-controls button {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-ink);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	h3 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		margin: var(--space-4) var(--gallery-content-inset, 0px) var(--space-3);
	}
	.gallery-thumbs {
		margin-inline: var(--gallery-content-inset, 0px);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
		gap: var(--space-2);
	}
	.gallery-thumb {
		height: 95px;
		min-width: 0;
		padding: 3px;
		border: 2px solid transparent;
		background: var(--color-surface-image);
		cursor: pointer;
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.gallery-thumb.active {
		border-color: var(--color-primary-text);
	}
	.gallery-thumb:hover {
		border-color: var(--color-text-muted);
	}
</style>
