<script lang="ts">
	import type { ArtworkImage } from '$lib/data/types';
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
			src="/images/{images[current].src}"
			alt=""
			onerror={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = 'none';
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
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
				>
			</button>
			<button
				class="gallery-arrow gallery-arrow-next"
				onclick={(e) => {
					e.stopPropagation();
					next();
				}}
				aria-label="Next image"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
				>
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
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
			</svg>
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
						src="/images/{img.src}"
						alt=""
						onerror={(e) => {
							(e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none';
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
