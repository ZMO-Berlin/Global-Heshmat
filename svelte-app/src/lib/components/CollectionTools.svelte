<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Entry } from '$lib/utils/collection';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { csv, exportRecords, download } from '$lib/utils/exports';
	let { items }: { items: Entry[] } = $props();
	const fieldbook = getFieldbook();
	const browse = getBrowseStore();
	const today = () => new Date().toISOString().slice(0, 10);
</script>

<nav class="collection-tools" aria-label="Collection research tools">
	<a href={resolve('/fieldbook')}>Fieldbook ({fieldbook.keys.length})</a>
	<a href={resolve('/trails')}>Place trails</a>
	<details>
		<summary>Use these {items.length} entries</summary>
		<div class="actions">
			<button disabled={!browse.ready || !items.length} onclick={() => fieldbook.add(items)}
				>Add results to fieldbook</button
			>
			<button
				disabled={!browse.ready || !items.length}
				onclick={() =>
					download(
						JSON.stringify(exportRecords(items, today()), null, 2),
						'global-heshmat-selection.json',
						'application/json'
					)}>Export JSON</button
			>
			<button
				disabled={!browse.ready || !items.length}
				onclick={() =>
					download(csv(items, today()), 'global-heshmat-selection.csv', 'text/csv;charset=utf-8')}
				>Export CSV</button
			>
		</div>
	</details>
</nav>

<style>
	.collection-tools,
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: start;
		margin-bottom: var(--space-4);
	}
	a,
	button,
	summary {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font: inherit;
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-3);
		color: var(--color-primary-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	summary {
		display: list-item;
	}
	.actions {
		margin-block: var(--space-2);
	}
</style>
