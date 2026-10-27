<script lang="ts">
	import type { MemoirEntity } from '$lib/data/memoir';

	// A name's book pages, each a button that opens the passage on that page
	// (the dialog's previous / next buttons reach the pages not shown).
	let {
		entity,
		shown = 5,
		onopen
	}: {
		entity: MemoirEntity;
		shown?: number;
		onopen: (entity: MemoirEntity, page: number, opener: HTMLButtonElement) => void;
	} = $props();

	const head = $derived(entity.pages.slice(0, shown));
	const rest = $derived(entity.pages.length - head.length);
</script>

{#if entity.pages.length}<span class="page-refs"
		>{entity.pages.length === 1 ? 'p.' : 'pp.'}
		{#each head as page (page)}<button
				type="button"
				class="page-ref"
				aria-label="Page {page}: passage naming {entity.name}"
				onclick={(event) => onopen(entity, page, event.currentTarget)}>{page}</button
			>{/each}{#if rest > 0}<button
				type="button"
				class="page-ref more"
				aria-label="{rest} more pages: passage naming {entity.name} on page {entity.pages[shown]}"
				onclick={(event) => onopen(entity, entity.pages[shown], event.currentTarget)}
				>{rest} more</button
			>{/if}</span
	>{/if}

<style>
	.page-refs {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1);
	}
	/* Compact for lists of pages, still a 24px target (WCAG 2.2 AA). The scoped
	   class outweighs the research pages' 44px button rule. */
	.page-ref {
		min-width: 28px;
		min-height: 24px;
		padding: 0 var(--space-1-5);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		color: var(--color-primary-text);
		font: inherit;
		font-variant-numeric: tabular-nums;
		line-height: 22px;
		cursor: pointer;
	}
	.page-ref:hover {
		border-color: var(--color-accent);
		background: var(--color-accent-light);
	}
</style>
