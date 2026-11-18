<script lang="ts">
	import { entryStatus, entryTitle, STATUS_LABELS, type Entry } from '#lib/utils/collection.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';
	import MarkerGlyph from './MarkerGlyph.svelte';
	import TrailThumb from './TrailThumb.svelte';
	let { item, step }: { item: Entry; step: number } = $props();
	const browse = getBrowseStore();
	const status = $derived(entryStatus(item));
</script>

<li class="stop">
	<span class="figure">
		<!-- The list already announces each position; the numeral is for sighted readers. -->
		<span class="step" aria-hidden="true">{step}</span>
		<TrailThumb {item} sizes="(max-width: 599px) 96px, (max-width: 999px) 300px, 240px" />
	</span>
	<span class="text">
		<a href={browse.entryHref(item, { view: 'gallery' })} dir="auto">{entryTitle(item)}</a>
		<span class="place" dir="auto">{item.city}, {item.country}</span>
		<span class="status"><MarkerGlyph kind={status} size={10} />{STATUS_LABELS[status]}</span>
	</span>
</li>

<style>
	.stop {
		position: relative;
		display: grid;
		grid-template-columns: auto 96px 1fr;
		gap: var(--space-3);
		align-items: start;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}
	.stop:hover {
		border-color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
	}
	.stop:has(a:focus-visible) {
		outline: var(--focus-ring-width) solid var(--focus-ring-color);
		outline-offset: var(--focus-ring-offset);
	}
	/* On a phone the numeral takes a column of its own, so it never covers the
	   small thumbnail; from 600px it sits on the corner of the larger photo. */
	.figure {
		display: contents;
	}
	.step {
		min-width: 1.5rem;
		color: var(--color-accent-text);
		font: var(--weight-semibold) var(--text-xl) / var(--leading-tight) var(--font-display);
		font-variant-numeric: lining-nums tabular-nums;
		text-align: center;
		padding-top: var(--space-1);
	}
	@media (min-width: 600px) {
		.figure {
			position: relative;
			display: block;
		}
		.step {
			position: absolute;
			top: var(--space-1);
			left: var(--space-1);
			min-width: 24px;
			height: 24px;
			padding-inline: var(--space-1-5);
			border-radius: var(--radius-pill);
			background: var(--color-surface);
			color: var(--color-ink);
			box-shadow: var(--shadow-sm);
			font: var(--weight-semibold) var(--text-xs) / 24px var(--font-body);
			padding-top: 0;
		}
	}
	.text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
		padding-block: var(--space-1);
	}
	.text a {
		color: var(--color-ink);
		font: var(--weight-semibold) var(--text-lg) / var(--leading-tight) var(--font-display);
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	/* The whole card is the link's target, so thumbnail taps open the record too. */
	.text a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.text a:focus-visible {
		outline: none;
	}
	.stop:hover .text a {
		color: var(--color-primary-text);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.place,
	.status {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		line-height: var(--leading-snug);
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
	}
	@media (min-width: 600px) {
		.stop {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
		.text {
			padding: 0 var(--space-1) var(--space-1);
		}
	}
</style>
