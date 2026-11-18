<script lang="ts">
	import { ImageOff } from '@lucide/svelte';
	import { coverImage, type Entry } from '#lib/utils/collection.js';
	import MediaImage from './MediaImage.svelte';
	/** Decorative: the title beside it names the record. Shared by trails and the fieldbook. */
	let { item, sizes }: { item: Entry; sizes: string } = $props();
	const cover = $derived(coverImage(item));
</script>

<span class="thumb">
	{#if cover}<MediaImage src={cover.src} {sizes} low />{:else}<span class="placeholder"
			><ImageOff size={20} aria-hidden="true" /><span>No photograph</span></span
		>{/if}
</span>

<style>
	.thumb {
		display: block;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--color-surface-image);
	}
	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		height: 100%;
		padding: var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		text-align: center;
	}
</style>
