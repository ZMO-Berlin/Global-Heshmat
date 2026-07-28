<script lang="ts">
	import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';
	import type { ArtworkImage } from '$lib/data/types';
	import { fullUrl, srcSet, thumbUrl } from '$lib/utils/image';
	import { hideOnError, hideParentOnError } from '$lib/utils/hide-on-error';
	import { trapFocus } from '$lib/utils/focus-trap';
	import { onMount, onDestroy } from 'svelte';

	let {
		images,
		name,
		current = $bindable(0),
		onclose
	}: { images: ArtworkImage[]; name: string; current: number; onclose: () => void } = $props();

	const multi = $derived(images.length > 1);

	let overlayEl: HTMLDivElement;

	function next() {
		current = (current + 1) % images.length;
	}
	function prev() {
		current = (current - 1 + images.length) % images.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onclose();
		} else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === overlayEl) onclose();
	}

	onMount(() => {
		// Teleport to document.body so that the sidebar's CSS transform
		// does not create a containing block that breaks position:fixed.
		document.body.appendChild(overlayEl);
		document.addEventListener('keydown', handleKeydown);
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
		document.body.style.overflow = '';
		// Clean up the teleported element
		if (overlayEl && overlayEl.parentNode) {
			overlayEl.parentNode.removeChild(overlayEl);
		}
	});
</script>

<!-- Backdrop click-to-close is a pointer convenience; keyboard users have the
     (initially focused) close button, Escape, and the arrow keys. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="lightbox-overlay"
	bind:this={overlayEl}
	onclick={handleOverlayClick}
	role="dialog"
	aria-modal="true"
	aria-label="Image viewer: {name}"
	tabindex="-1"
	use:trapFocus
>
	<button class="lightbox-close" onclick={onclose} aria-label="Close">
		<X size={22} strokeWidth={2} />
	</button>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-prev" onclick={prev} aria-label="Previous image">
			<ChevronLeft size={22} strokeWidth={2.5} />
		</button>
	{/if}

	<div class="lightbox-content">
		<!-- The lightbox stage is 85vw, so a wide or high-DPI screen gets the
		     2000px candidate while a phone stays on the 1200px one. -->
		<img
			class="lightbox-img"
			src={fullUrl(images[current].src)}
			srcset={srcSet(images[current].src)}
			sizes="85vw"
			alt={images[current].caption || name}
			decoding="async"
			use:hideOnError
		/>
		{#if images[current].caption}
			<div class="lightbox-caption">{images[current].caption}</div>
		{/if}
		{#if multi}
			<div class="lightbox-counter">{current + 1} / {images.length}</div>
		{/if}
	</div>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-next" onclick={next} aria-label="Next image">
			<ChevronRight size={22} strokeWidth={2.5} />
		</button>

		<div class="lightbox-thumbs">
			{#each images as img, i (img.src)}
				<button
					type="button"
					class="lightbox-thumb"
					class:active={i === current}
					aria-label="Show image {i + 1} of {images.length}"
					aria-current={i === current}
					onclick={() => (current = i)}
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

<style>
	/* Full-screen image viewer. The overlay is teleported to <body> on mount,
	   which does not affect scoping — the class travels with the element. */
	/* ═══════════════════════════════════════════
	   Lightbox
	   ═══════════════════════════════════════════ */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-lightbox);
		background: var(--scrim-lightbox);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		animation: fadeIn var(--duration-slow) var(--ease-out);
	}

	.lightbox-close {
		position: absolute;
		top: 18px;
		right: 22px;
		width: 42px;
		height: 42px;
		border: 1px solid rgb(var(--color-on-dark-rgb) / 0.15);
		background: rgb(var(--color-on-dark-rgb) / 0.05);
		color: var(--color-on-dark);
		font-size: var(--text-3xl);
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
		transition: all var(--duration-base) var(--ease-out);
		z-index: var(--z-lightbox-ui);
		backdrop-filter: blur(var(--scrim-blur-strong));
	}

	.lightbox-close:hover {
		opacity: 1;
		background: rgb(var(--color-on-dark-rgb) / 0.12);
		border-color: rgb(var(--color-on-dark-rgb) / 0.3);
	}

	.lightbox-content {
		position: relative;
		max-width: 85vw;
		max-height: 75vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.lightbox-img {
		max-width: 85vw;
		max-height: 75vh;
		object-fit: contain;
		/* Honour EXIF orientation — some source photos are stored rotated. */
		image-orientation: from-image;
		border-radius: var(--radius-sm);
		user-select: none;
		box-shadow: var(--shadow-lightbox-img);
	}

	.lightbox-caption {
		position: absolute;
		bottom: -34px;
		left: 0;
		right: 0;
		text-align: center;
		color: rgb(var(--color-on-dark-rgb) / 0.7);
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-style: italic;
	}

	.lightbox-counter {
		position: absolute;
		top: -30px;
		left: 0;
		right: 0;
		text-align: center;
		color: rgb(var(--color-on-dark-rgb) / 0.6);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-mono);
	}

	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		border: 1px solid rgb(var(--color-on-dark-rgb) / 0.1);
		border-radius: 50%;
		background: rgb(var(--color-on-dark-rgb) / 0.06);
		color: var(--color-on-dark);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--duration-base) var(--ease-out);
		z-index: var(--z-lightbox-ui);
		backdrop-filter: blur(var(--scrim-blur-strong));
	}

	.lightbox-nav:hover {
		background: rgb(var(--color-on-dark-rgb) / 0.15);
		border-color: rgb(var(--color-on-dark-rgb) / 0.25);
	}

	/* The icon is a Lucide component, so its <svg> is compiled in that
	   component's scope, not ours — the selector must be :global(). */
	.lightbox-nav :global(svg) {
		width: 22px;
		height: 22px;
	}

	.lightbox-nav-prev {
		left: 24px;
	}

	.lightbox-nav-next {
		right: 24px;
	}

	.lightbox-thumbs {
		display: flex;
		gap: var(--space-1-5);
		padding: var(--space-3-5) var(--space-4);
		max-width: 80vw;
		overflow-x: auto;
		margin-top: var(--space-7);
		scrollbar-width: thin;
		scrollbar-color: rgb(var(--color-on-dark-rgb) / 0.2) transparent;
	}

	.lightbox-thumb {
		width: 64px;
		height: 44px;
		flex-shrink: 0;
		padding: 0;
		background: none;
		border-radius: var(--radius-xs);
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		opacity: 0.35;
		transition: all var(--duration-base) var(--ease-out);
	}

	.lightbox-thumb:hover {
		opacity: 0.65;
	}

	.lightbox-thumb.active {
		opacity: 1;
		border-color: var(--color-accent);
	}

	.lightbox-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (max-width: 768px) {
		.lightbox-nav {
			width: 38px;
			height: 38px;
		}

		.lightbox-nav-prev {
			left: 10px;
		}

		.lightbox-nav-next {
			right: 10px;
		}

		.lightbox-thumb {
			width: 48px;
			height: 34px;
		}

		.lightbox-content {
			max-width: 95vw;
			max-height: 70vh;
		}

		.lightbox-img {
			max-width: 95vw;
			max-height: 70vh;
		}
	}
</style>
