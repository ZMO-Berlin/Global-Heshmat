<script lang="ts">
	import { resolve } from '$app/paths';
	import { BookMarked, ChevronDown, Route } from '@lucide/svelte';
	import type { Entry } from '$lib/utils/collection';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { csv, exportRecords, download } from '$lib/utils/exports';
	import { countLabel } from '$lib/utils/text';
	let { items }: { items: Entry[] } = $props();
	const fieldbook = getFieldbook();
	const browse = getBrowseStore();
	const today = () => new Date().toISOString().slice(0, 10);
	const scope = $derived(countLabel(items.length, 'entry', 'entries'));
	let menu = $state<HTMLDetailsElement>();
	let summary = $state<HTMLElement>();

	/** Run an action on the entries shown, then fold the menu away. */
	function run(action: () => void) {
		action();
		if (menu) menu.open = false;
	}
	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !menu?.open) return;
		event.stopPropagation();
		menu.open = false;
		summary?.focus();
	}
</script>

<!-- Capture phase: Escape folds the menu before the layout's own Escape handling sees it. -->
<svelte:window
	onkeydowncapture={closeOnEscape}
	onclick={(event) => {
		if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
	}}
/>

<nav class="collection-tools" aria-label="Collection research tools">
	<a href={resolve('/fieldbook')}
		><BookMarked size={16} aria-hidden="true" />Fieldbook ({fieldbook.keys.length})</a
	>
	<a href={resolve('/trails')}><Route size={16} aria-hidden="true" />Place trails</a>
	<!-- A disclosure, not a link: it acts on the entries currently shown. -->
	<details class="save" bind:this={menu}>
		<summary bind:this={summary}
			>Save or export {scope}<ChevronDown class="chevron" size={16} aria-hidden="true" /></summary
		>
		<div class="actions">
			<button
				disabled={!browse.ready || !items.length}
				onclick={() => run(() => fieldbook.add(items))}>Add to fieldbook</button
			>
			<button
				disabled={!browse.ready || !items.length}
				onclick={() =>
					run(() =>
						download(
							JSON.stringify(exportRecords(items, today()), null, 2),
							'global-heshmat-selection.json',
							'application/json'
						)
					)}>Download JSON</button
			>
			<button
				disabled={!browse.ready || !items.length}
				onclick={() =>
					run(() =>
						download(csv(items, today()), 'global-heshmat-selection.csv', 'text/csv;charset=utf-8')
					)}>Download CSV</button
			>
		</div>
	</details>
</nav>

<style>
	.collection-tools {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		margin-bottom: var(--space-4);
	}
	/* One control style for all three: the border marks them as controls, so
	   the links drop their underline; icons say which is which at a glance. */
	a,
	summary {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-primary-text);
		text-decoration: none;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}
	a:hover,
	summary:hover,
	.save[open] summary {
		border-color: var(--color-primary-text);
		background: var(--color-primary-light);
	}
	/* Hide the native disclosure triangle; the chevron replaces it. */
	summary {
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary :global(.chevron) {
		transition: transform var(--duration-fast) var(--ease-out);
	}
	.save[open] summary :global(.chevron) {
		transform: rotate(180deg);
	}
	.save {
		position: relative;
	}
	/* The actions open as a small panel over the results, so the toolbar
	   itself never reflows. */
	.actions {
		position: absolute;
		top: calc(100% + var(--space-1));
		left: 0;
		z-index: 5;
		display: grid;
		gap: var(--space-1);
		min-width: 100%;
		width: max-content;
		max-width: calc(100vw - 2 * var(--space-4));
		padding: var(--space-2);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}
	button {
		min-height: 44px;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--text-sm);
		text-align: start;
		color: var(--color-primary-text);
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		background: var(--color-primary-light);
	}
	button:disabled {
		cursor: default;
		opacity: 0.6;
	}
</style>
