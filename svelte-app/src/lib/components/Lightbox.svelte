<script lang="ts">
	import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';
	import type { ArtworkImage } from '$lib/data/types';
	import { thumbUrl, webUrl, originalUrl, swapToOriginal } from '$lib/utils/image';
	import { onMount, onDestroy } from 'svelte';

	let {
		images,
		current = $bindable(0),
		onclose
	}: { images: ArtworkImage[]; current: number; onclose: () => void } = $props();

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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="lightbox-overlay" bind:this={overlayEl} onclick={handleOverlayClick}>
	<button class="lightbox-close" onclick={onclose} aria-label="Close">
		<X size={22} strokeWidth={2} />
	</button>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-prev" onclick={prev} aria-label="Previous">
			<ChevronLeft size={22} strokeWidth={2.5} />
		</button>
	{/if}

	<div class="lightbox-content">
		<img
			class="lightbox-img"
			src={webUrl(images[current].src)}
			data-fallback={originalUrl(images[current].src)}
			alt=""
			onerror={(e) => {
				const el = e.currentTarget as HTMLImageElement;
				if (!swapToOriginal(el)) el.style.display = 'none';
			}}
		/>
		{#if images[current].caption}
			<div class="lightbox-caption">{images[current].caption}</div>
		{/if}
		{#if multi}
			<div class="lightbox-counter">{current + 1} / {images.length}</div>
		{/if}
	</div>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-next" onclick={next} aria-label="Next">
			<ChevronRight size={22} strokeWidth={2.5} />
		</button>

		<div class="lightbox-thumbs">
			{#each images as img, i (img.src)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="lightbox-thumb" class:active={i === current} onclick={() => (current = i)}>
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
