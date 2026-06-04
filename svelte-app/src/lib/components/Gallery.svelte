<script lang="ts">
	import { ChevronLeft, ChevronRight, Maximize2 } from '@lucide/svelte';
	import type { ArtworkImage } from '$lib/data/types';
	import { thumbUrl, webUrl, originalUrl, swapToOriginal } from '$lib/utils/image';
	import Lightbox from './Lightbox.svelte';

	let { images }: { images: ArtworkImage[] } = $props();

	let current = $state(0);
	let lightboxOpen = $state(false);

	const multi = $derived(images.length > 1);

	function next() {
		current = (current + 1) % images.length;
	}
	function prev() {
		current = (current - 1 + images.length) % images.length;
	}
	function goTo(idx: number) {
		current = idx;
	}
</script>

<div class="gallery">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="gallery-main" onclick={() => (lightboxOpen = true)}>
		<img
			src={webUrl(images[current].src)}
			data-fallback={originalUrl(images[current].src)}
			alt=""
			onerror={(e) => {
				const el = e.currentTarget as HTMLImageElement;
				if (!swapToOriginal(el)) el.style.display = 'none';
			}}
		/>

		{#if multi}
			<div class="gallery-counter">
				{current + 1} / {images.length}
			</div>
			<button
				class="gallery-arrow gallery-arrow-prev"
				onclick={(e) => {
					e.stopPropagation();
					prev();
				}}
				aria-label="Previous image"
			>
				<ChevronLeft size={16} strokeWidth={2.5} />
			</button>
			<button
				class="gallery-arrow gallery-arrow-next"
				onclick={(e) => {
					e.stopPropagation();
					next();
				}}
				aria-label="Next image"
			>
				<ChevronRight size={16} strokeWidth={2.5} />
			</button>
		{/if}

		<button
			class="gallery-expand"
			onclick={(e) => {
				e.stopPropagation();
				lightboxOpen = true;
			}}
			aria-label="View full screen"
		>
			<Maximize2 size={16} strokeWidth={2} />
		</button>

		{#if images[current].caption}
			<div class="gallery-caption">{images[current].caption}</div>
		{/if}
	</div>

	{#if multi}
		<div class="gallery-thumbs">
			{#each images as img, i (img.src)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="gallery-thumb" class:active={i === current} onclick={() => goTo(i)}>
					<img
						src={thumbUrl(img.src)}
						data-fallback={originalUrl(img.src)}
						alt=""
						loading="lazy"
						onerror={(e) => {
							const el = e.currentTarget as HTMLImageElement;
							if (!swapToOriginal(el)) el.parentElement!.style.display = 'none';
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if lightboxOpen}
	<Lightbox {images} bind:current onclose={() => (lightboxOpen = false)} />
{/if}
