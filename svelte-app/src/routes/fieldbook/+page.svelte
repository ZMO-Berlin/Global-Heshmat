<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { entries } from '#lib/data/entries.js';
	import { getFieldbook } from '#lib/stores/fieldbook.svelte.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';
	import { entryKey, entryTitle, type Entry } from '#lib/utils/collection.js';
	import { albumBytes, albumAvailable, saveAlbum, removeAlbum } from '#lib/offline/client.js';
	import { downloadRecordsCsv, downloadRecordsJson } from '#lib/utils/exports.js';
	import { countLabel, megabytes } from '#lib/utils/text.js';
	import Seo from '#lib/components/Seo.svelte';
	import FieldbookEntry from '#lib/components/FieldbookEntry.svelte';
	const fieldbook = getFieldbook();
	const browse = getBrowseStore();
	const items = $derived(entries.filter((item) => fieldbook.has(item)));
	const bytes = $derived(items.reduce((sum, item) => sum + albumBytes(item), 0));
	let availability = $state<Record<string, boolean>>({});
	let busy = $state(false);
	let message = $state('');
	let cancelled = false;
	async function refresh(list = items) {
		availability = Object.fromEntries(
			await Promise.all(list.map(async (item) => [entryKey(item), await albumAvailable(item)]))
		);
	}
	// The selection loads from device storage after mount, so check whatever is
	// selected whenever it changes rather than once on mount.
	$effect(() => {
		void refresh(items).catch(() => {});
	});
	onMount(() => {
		const check = () => void refresh().catch(() => {});
		window.addEventListener('online', check);
		return () => {
			cancelled = true;
			window.removeEventListener('online', check);
		};
	});
	async function save() {
		busy = true;
		cancelled = false;
		let saved = 0;
		const batch = [...items];
		try {
			for (const item of batch) {
				if (cancelled) break;
				await saveAlbum(item, (done, total) => {
					message = `${entryTitle(item)}: ${done}/${total} images; ${saved}/${batch.length} albums saved.`;
				});
				availability[entryKey(item)] = true;
				saved++;
			}
			message = `${saved} albums saved.${cancelled ? ' Download stopped.' : ''}`;
		} catch (error) {
			message =
				error instanceof Error ? error.message : 'Download failed. Try again when connected.';
		} finally {
			busy = false;
		}
	}
	async function remove(item: Entry) {
		await removeAlbum(item);
		availability[entryKey(item)] = false;
		fieldbook.toggle(item);
	}
</script>

<Seo
	title="Fieldbook — Global Heshmat"
	description="Select collection entries, export research records, and save albums for offline use on this device."
	path="/fieldbook/"
/>
<div class="research-page">
	<div class="research-inner fieldbook-inner">
		<a class="back" href={resolve('/collection')}>Back to collection</a>
		<h2>Your fieldbook</h2>
		<div class="intro">
			<p>
				Select entries from an album or add filtered collection results. Selections are stored on
				this device.
			</p>
			<p>
				Saved albums include entry text and reading-size images. Video, high-resolution images,
				external sites and new map regions need a connection. Check availability before travelling:
				browser cleanup and site updates can remove saved copies.
			</p>
		</div>
		<noscript
			><p>
				Fieldbook selection and downloads require JavaScript. All collection records remain readable
				from the collection index.
			</p></noscript
		>
		{#if items.length}
			<div class="toolbar">
				<p class="summary">
					{countLabel(items.length, 'selected entry', 'selected entries')} · estimated image download
					<span class="nowrap">{megabytes(bytes)}</span>
				</p>
				<div class="actions">
					<div class="group" role="group" aria-label="Offline use">
						<button class="primary" disabled={busy || !browse.ready} onclick={() => void save()}
							>Save selected albums offline</button
						>
						{#if busy}<button
								onclick={() => {
									cancelled = true;
									message = 'Stopping after the current album…';
								}}>Stop after current album</button
							>{/if}
						<button disabled={busy} onclick={() => void refresh()}>Check availability</button>
					</div>
					<div class="group" role="group" aria-label="Export records">
						<button onclick={() => downloadRecordsJson(items, 'global-heshmat-fieldbook.json')}
							>Export JSON</button
						>
						<button onclick={() => downloadRecordsCsv(items, 'global-heshmat-fieldbook.csv')}
							>Export CSV</button
						>
					</div>
				</div>
			</div>
			<ul class="fieldbook-list">
				{#each items as item (entryKey(item))}<FieldbookEntry
						{item}
						available={!!availability[entryKey(item)]}
						disabled={busy}
						onremove={() => void remove(item)}
					/>{/each}
			</ul>
		{:else}<p class="empty">
				Your fieldbook is empty. <a href={resolve('/collection')}>Browse the collection</a> or
				explore <a href={resolve('/trails')}>trails</a>.
			</p>{/if}
		<p class="status" role="status">{message || fieldbook.storageMessage}</p>
	</div>
</div>

<style>
	.fieldbook-inner {
		max-width: 1320px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.intro {
		max-width: 75ch;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3) var(--space-5);
		margin-top: var(--space-6);
		padding-block: var(--space-4);
		border-block: 1px solid var(--color-border);
	}
	.toolbar .summary {
		margin: 0;
		color: var(--color-text);
		font-weight: var(--weight-medium);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-5);
	}
	.nowrap {
		white-space: nowrap;
	}
	.group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.group + .group {
		padding-inline-start: var(--space-5);
		border-inline-start: 1px solid var(--color-border);
	}
	.actions button {
		border-radius: var(--radius-pill);
		padding-inline: var(--space-4);
	}
	.actions .primary {
		background: var(--color-primary-text);
		border-color: var(--color-primary-text);
		color: var(--color-on-dark);
		font-weight: var(--weight-medium);
	}
	.actions button:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.fieldbook-list {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-5);
		list-style: none;
	}
	.status:empty {
		margin: 0;
	}
	@media (min-width: 1100px) {
		.fieldbook-list {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-3);
		}
	}
	@media (max-width: 600px) {
		.fieldbook-inner {
			padding: var(--space-4);
		}
		.group + .group {
			padding-inline-start: 0;
			border-inline-start: none;
		}
	}
</style>
