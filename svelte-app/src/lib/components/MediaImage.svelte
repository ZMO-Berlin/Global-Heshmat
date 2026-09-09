<script lang="ts">
	import { ImageOff } from '@lucide/svelte';
	import { thumbUrl, webUrl, fullUrl, cardSrcSet, srcSet, imageDimensions } from '$lib/utils/image';
	let {
		src,
		alt = '',
		size = 'card',
		sizes = '100vw',
		priority = false,
		fit = 'contain'
	}: {
		src: string;
		alt?: string;
		size?: 'card' | 'web' | 'full';
		sizes?: string;
		priority?: boolean;
		fit?: 'contain' | 'cover';
	} = $props();
	let failed = $state(false);
	const dimensions = $derived(imageDimensions(src, size === 'card' ? 'thumb' : size));
	$effect(() => {
		void src;
		failed = false;
	});
</script>

<span class="media" class:failed>
	<img
		src={size === 'card' ? thumbUrl(src) : size === 'full' ? fullUrl(src) : webUrl(src)}
		srcset={size === 'card' ? cardSrcSet(src) : srcSet(src)}
		{sizes}
		{alt}
		width={dimensions.width}
		height={dimensions.height}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
		style:object-fit={fit}
		onerror={() => (failed = true)}
		onload={() => (failed = false)}
	/>
	{#if failed}<span class="media-error" role="img" aria-label={alt || 'Image unavailable'}
			><ImageOff size={24} aria-hidden="true" /><span>Image unavailable</span></span
		>{/if}
</span>

<style>
	.media {
		display: grid;
		grid-template-areas: 'image';
		width: 100%;
		height: 100%;
		min-height: 0;
		background: var(--color-surface-image);
		overflow: hidden;
	}
	img {
		grid-area: image;
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
	}
	.failed img {
		visibility: hidden;
	}
	.media-error {
		grid-area: image;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3);
		color: var(--color-text-secondary);
		font: var(--text-sm) var(--font-body);
	}
</style>
