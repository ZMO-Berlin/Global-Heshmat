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

<style>
	/* Image gallery: fixed-aspect stage, hover affordances, thumbnail strip. */
	/* ═══════════════════════════════════════════
	   Gallery
	   ═══════════════════════════════════════════ */
	.gallery-main {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--color-surface-image);
		position: relative;
		cursor: pointer;
	}

	/* The full-bleed button that makes the main image itself the lightbox
	   trigger (keyboard-focusable, unlike the old clickable div). */
	.gallery-open {
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.gallery-main img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Honour EXIF orientation — some source photos are stored rotated. */
		image-orientation: from-image;
		display: block;
		transition: transform calc(var(--duration-slower) + 100ms) var(--ease-out);
	}

	.gallery-main:hover img {
		transform: scale(1.03);
	}

	.gallery-counter {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgb(var(--color-header-bg-rgb) / 0.65);
		color: var(--color-on-dark);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		padding: 3px var(--space-2-5);
		border-radius: var(--radius-pill);
		pointer-events: none;
		letter-spacing: var(--tracking-wider);
		backdrop-filter: blur(var(--scrim-blur-strong));
	}

	.gallery-expand {
		position: absolute;
		bottom: 12px;
		right: 12px;
		width: 44px;
		height: 44px;
		border: none;
		border-radius: var(--radius-sm);
		background: rgb(var(--color-header-bg-rgb) / 0.5);
		color: var(--color-on-dark);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition:
			background-color var(--duration-slow) var(--ease-out),
			opacity var(--duration-slow) var(--ease-out);
		backdrop-filter: blur(var(--scrim-blur-strong));
	}

	/* The icon is a Lucide component, so its <svg> is compiled in that
	   component's scope, not ours — the selector must be :global(). */
	.gallery-expand :global(svg) {
		width: 16px;
		height: 16px;
	}

	.gallery-main:hover .gallery-expand,
	.gallery-main:focus-within .gallery-expand,
	.gallery-expand:focus-visible {
		opacity: 1;
	}

	.gallery-expand:hover {
		background: rgb(var(--color-header-bg-rgb) / 0.7);
	}

	.gallery-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 44px;
		height: 44px;
		border: none;
		border-radius: 50%;
		background: rgb(var(--color-header-bg-rgb) / 0.45);
		color: var(--color-on-dark);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition:
			background-color var(--duration-slow) var(--ease-out),
			opacity var(--duration-slow) var(--ease-out);
		backdrop-filter: blur(var(--scrim-blur-strong));
	}

	/* The icon is a Lucide component, so its <svg> is compiled in that
	   component's scope, not ours — the selector must be :global(). */
	.gallery-arrow :global(svg) {
		width: 16px;
		height: 16px;
	}

	.gallery-main:hover .gallery-arrow,
	.gallery-main:focus-within .gallery-arrow,
	.gallery-arrow:focus-visible {
		opacity: 1;
	}

	.gallery-arrow:hover {
		background: rgb(var(--color-header-bg-rgb) / 0.7);
	}

	.gallery-arrow-prev {
		left: 10px;
	}

	.gallery-arrow-next {
		right: 10px;
	}

	.gallery-caption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: var(--space-1-5) var(--space-3-5);
		background: linear-gradient(to top, rgb(var(--color-header-bg-rgb) / 0.6), transparent);
		color: var(--color-on-dark);
		font-size: var(--text-xs);
		font-style: italic;
		pointer-events: none;
		padding-top: var(--space-6);
	}

	.gallery-thumbs {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-2-5);
		background: var(--color-surface-warm);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.gallery-thumb {
		width: 56px;
		height: 40px;
		flex-shrink: 0;
		padding: 0;
		background: none;
		border-radius: var(--radius-xs);
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		opacity: 0.55;
		transition:
			border-color var(--duration-base) var(--ease-out),
			opacity var(--duration-base) var(--ease-out);
	}

	.gallery-thumb:hover {
		opacity: 0.85;
	}

	.gallery-thumb.active {
		opacity: 1;
		border-color: var(--color-accent);
	}

	.gallery-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (prefers-reduced-motion: reduce) {
		.gallery-main:hover img {
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.gallery-arrow {
			width: 44px;
			height: 44px;
			opacity: 1;
		}

		.gallery-expand {
			opacity: 1;
		}

		.gallery-thumb {
			width: 44px;
			height: 32px;
		}
	}
</style>
