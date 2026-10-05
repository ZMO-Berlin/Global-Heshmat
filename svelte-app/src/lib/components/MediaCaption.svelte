<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Source and contribution URLs are external, validated editorial links. */
	import type { ArtworkImage } from '$lib/data/types';
	let { image, fallback = '' }: { image: ArtworkImage; fallback?: string } = $props();
</script>

<div class="media-caption" dir="auto">
	{#if image.caption || fallback}<p>{image.caption || fallback}</p>{/if}
	{#if image.credit}<p>Credit: {image.credit}</p>{/if}
	{#if image.date}<p>Date: {image.date}</p>{/if}
	{#if image.sourceUrl}<p>
			<a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">Image source</a>
		</p>{/if}
	{#if image.rightsHolder}<p>Rights holder: {image.rightsHolder}</p>{/if}
	{#if image.rights}<p>{image.rights}</p>{/if}
</div>

<style>
	.media-caption {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		overflow-wrap: anywhere;
	}
	a {
		color: inherit;
		text-underline-offset: 3px;
	}
</style>
