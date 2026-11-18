<script lang="ts">
	import { CloudCheck, CloudDownload } from '@lucide/svelte';
	import { entryTitle, type Entry } from '#lib/utils/collection.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';
	import TrailThumb from './TrailThumb.svelte';
	let {
		item,
		available,
		disabled,
		onremove
	}: { item: Entry; available: boolean; disabled: boolean; onremove: () => void } = $props();
	const browse = getBrowseStore();
</script>

<li class="entry">
	<TrailThumb {item} sizes="88px" />
	<div class="text">
		<a href={browse.entryHref(item, { view: 'gallery' })} dir="auto">{entryTitle(item)}</a>
		<p>
			<span class="place" dir="auto">{item.city}, {item.country}</span><span
				class="sep"
				aria-hidden="true">&nbsp;·</span
			>
			<span class="offline" class:available
				>{#if available}<CloudCheck size={14} aria-hidden="true" />Available offline{:else}<CloudDownload
						size={14}
						aria-hidden="true"
					/>Download needed{/if}</span
			>
		</p>
	</div>
	<button {disabled} onclick={onremove}
		>Remove <span class="sr-only">{entryTitle(item)}</span></button
	>
</li>

<style>
	.entry {
		display: grid;
		grid-template-columns: 88px 1fr auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}
	.text {
		min-width: 0;
	}
	.text a {
		color: var(--color-ink);
		font: var(--weight-semibold) var(--text-lg) / var(--leading-tight) var(--font-display);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		overflow-wrap: anywhere;
	}
	.text a:hover {
		color: var(--color-primary-text);
	}
	.text p {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		line-height: var(--leading-snug);
	}
	.offline {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		white-space: nowrap;
	}
	.available {
		color: var(--color-primary-text);
	}
	button {
		color: var(--color-text-secondary);
	}
	@media (max-width: 480px) {
		.entry {
			grid-template-columns: 64px 1fr auto;
			gap: var(--space-2-5);
		}
		.text a {
			font-size: var(--text-md);
		}
		.place,
		.offline {
			display: flex;
		}
		.sep {
			display: none;
		}
	}
</style>
