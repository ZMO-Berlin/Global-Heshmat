<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { type Entry, entryKey } from '$lib/utils/collection';
	import { citation, bibtex, ris, csv, exportRecords, download } from '$lib/utils/exports';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import {
		albumAvailable,
		albumBytes,
		saveAlbum,
		removeAlbum,
		offlineSupported
	} from '$lib/offline/client';
	let { item }: { item: Entry } = $props();
	const fieldbook = getFieldbook();
	const browse = getBrowseStore();
	let accessed = $state('');
	let available = $state(false);
	let busy = $state(false);
	let message = $state('');
	let citationText = $derived(citation(item, accessed || 'YYYY-MM-DD'));
	onMount(() => {
		accessed = new Date().toISOString().slice(0, 10);
		const refresh = () =>
			void albumAvailable(item)
				.then((value) => {
					available = value;
				})
				.catch(() => {
					available = false;
				});
		refresh();
		window.addEventListener('online', refresh);
		navigator.serviceWorker?.addEventListener('controllerchange', refresh);
		return () => {
			window.removeEventListener('online', refresh);
			navigator.serviceWorker?.removeEventListener('controllerchange', refresh);
		};
	});
	async function save() {
		busy = true;
		message = '';
		try {
			await saveAlbum(item, (done, total) => {
				message = `Saving images: ${done} / ${total}`;
			});
			fieldbook.add([item]);
			available = true;
			message = 'Album saved on this device.';
		} catch (error) {
			message = error instanceof Error ? error.message : 'The album could not be saved.';
		} finally {
			busy = false;
		}
	}
	async function remove() {
		await removeAlbum(item);
		available = false;
		message = 'Saved album removed. Your fieldbook selection is retained.';
	}
	async function copy() {
		try {
			await navigator.clipboard.writeText(citationText);
			message = 'Citation copied.';
		} catch {
			message = 'Copy is unavailable. Select the citation text below to copy it.';
		}
	}
</script>

<section class="entry-tools" aria-label="Research tools">
	<div class="tool-actions">
		<button
			disabled={!browse.ready}
			aria-pressed={fieldbook.has(item)}
			onclick={() => fieldbook.toggle(item)}
			>{fieldbook.has(item) ? 'Remove from fieldbook' : 'Add to fieldbook'}</button
		>
		<a href={resolve('/fieldbook')}>Open fieldbook</a>
	</div>
	<details>
		<summary>Cite and export this entry</summary>
		<p class="citation" dir="auto">{citationText}</p>
		<p class="tool-note">
			The institution is cited as the collection publisher. “n.d.” means no record update date is
			documented.
		</p>
		<div class="tool-actions">
			<button disabled={!browse.ready} onclick={copy}>Copy citation</button>
			<button
				disabled={!browse.ready}
				onclick={() => download(bibtex(item, accessed), `${entryKey(item).replace(':', '-')}.bib`)}
				>BibTeX</button
			>
			<button
				disabled={!browse.ready}
				onclick={() =>
					download(
						ris(item, accessed),
						`${entryKey(item).replace(':', '-')}.ris`,
						'application/x-research-info-systems'
					)}>RIS</button
			>
			<button
				disabled={!browse.ready}
				onclick={() =>
					download(
						JSON.stringify(exportRecords([item], accessed), null, 2),
						`${item.slug}.json`,
						'application/json'
					)}>JSON</button
			>
			<button
				disabled={!browse.ready}
				onclick={() =>
					download(csv([item], accessed), `${item.slug}.csv`, 'text/csv;charset=utf-8')}>CSV</button
			>
		</div>
	</details>
	<details>
		<summary>Use this album offline</summary>
		<p class="tool-note">
			Save the entry and reading-size images (about {(albumBytes(item) / 1048576).toFixed(1)} MB). Videos,
			full-resolution images, external links and new map regions need a connection. Browser storage can
			be cleared; check availability before travelling. Site updates require a new download.
		</p>
		{#if available}<p>Available offline on this device.</p>
			<button disabled={busy} onclick={() => void remove()}>Remove saved album</button>
		{:else}<button
				disabled={!browse.ready || busy || !offlineSupported()}
				onclick={() => void save()}>{busy ? 'Saving…' : 'Save album offline'}</button
			>{/if}
	</details>
	<p role="status" class="tool-message">{message || fieldbook.storageMessage}</p>
</section>

<style>
	.entry-tools {
		margin-block: var(--space-5);
		border-block: 1px solid var(--color-border);
		padding-block: var(--space-3);
	}
	.tool-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	button,
	a {
		font: inherit;
		font-size: var(--text-sm);
		min-height: 44px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-primary-text);
		cursor: pointer;
	}
	a {
		display: inline-flex;
		align-items: center;
	}
	summary {
		min-height: 44px;
		padding-block: var(--space-3);
		cursor: pointer;
	}
	.citation {
		overflow-wrap: anywhere;
		user-select: text;
		line-height: var(--leading-relaxed);
	}
	.tool-note,
	.tool-message {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-block: var(--space-2);
	}
	button:disabled {
		cursor: wait;
		opacity: 0.6;
	}
</style>
