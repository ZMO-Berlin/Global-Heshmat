<script lang="ts">
	import { ChevronLeft, ChevronRight, Maximize2 } from '@lucide/svelte';
	import type { ArtworkImage } from '$lib/data/types';
	import { srcSet, thumbUrl, webUrl } from '$lib/utils/image';
	import { hideOnError, hideParentOnError } from '$lib/utils/hide-on-error';
	import Lightbox from './Lightbox.svelte';

	let { images, name }: { images: ArtworkImage[]; name: string } = $props();

	let current = $state(0);
	let lightboxOpen = $state(false);

	const multi = $derived(images.length > 1);

	// Defensive: if the `images` prop is ever swapped for a shorter list on a
	// live instance, snap back to the first image rather than indexing past
	// the end (the Sidebar keys this component per item, but the guard keeps
	// the component safe wherever it's used).
	$effect(() => {
		if (current >= images.length) current = 0;
	});

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
	<div class="gallery-main">
		<!-- The whole image is the click/tap/Enter target for the lightbox; the
		     arrows and the expand affordance sit on top as separate buttons. -->
		<button
			type="button"
			class="gallery-open"
			onclick={() => (lightboxOpen = true)}
			aria-label="View image full screen"
		>
			<!-- The gallery slot is the sidebar width on desktop and the full
			     viewport on mobile; `sizes` says so, otherwise the browser assumes
			     100vw and pulls the 2000px candidate on a phone. -->
			<img
				src={webUrl(images[current].src)}
				srcset={srcSet(images[current].src)}
				sizes="(max-width: 768px) 100vw, 460px"
				alt={images[current].caption || name}
				decoding="async"
				use:hideOnError
			/>
		</button>

		{#if multi}
			<div class="gallery-counter">
				{current + 1} / {images.length}
			</div>
			<button class="gallery-arrow gallery-arrow-prev" onclick={prev} aria-label="Previous image">
				<ChevronLeft size={16} strokeWidth={2.5} />
			</button>
			<button class="gallery-arrow gallery-arrow-next" onclick={next} aria-label="Next image">
				<ChevronRight size={16} strokeWidth={2.5} />
			</button>
		{/if}

		<button
			class="gallery-expand"
			onclick={() => (lightboxOpen = true)}
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
				<button
					type="button"
					class="gallery-thumb"
					class:active={i === current}
					aria-label="Show image {i + 1} of {images.length}"
					aria-current={i === current}
					onclick={() => goTo(i)}
				>
					<img
						src={thumbUrl(img.src)}
						alt=""
						loading="lazy"
						decoding="async"
						use:hideParentOnError
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if lightboxOpen}
	<Lightbox {images} {name} bind:current onclose={() => (lightboxOpen = false)} />
{/if}
