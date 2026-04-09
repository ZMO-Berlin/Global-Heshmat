<script lang="ts">
	import type { ArtworkImage } from '$lib/data/types';
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
	<button class="lightbox-close" onclick={onclose} aria-label="Close">&times;</button>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-prev" onclick={prev} aria-label="Previous">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
			>
		</button>
	{/if}

	<div class="lightbox-content">
		<img class="lightbox-img" src="/images/{images[current].src}" alt="" />
		{#if images[current].caption}
			<div class="lightbox-caption">{images[current].caption}</div>
		{/if}
		{#if multi}
			<div class="lightbox-counter">{current + 1} / {images.length}</div>
		{/if}
	</div>

	{#if multi}
		<button class="lightbox-nav lightbox-nav-next" onclick={next} aria-label="Next">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
			>
		</button>

		<div class="lightbox-thumbs">
			{#each images as img, i (img.src)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="lightbox-thumb" class:active={i === current} onclick={() => (current = i)}>
					<img src="/images/{img.src}" alt="" />
				</div>
			{/each}
		</div>
	{/if}
</div>
