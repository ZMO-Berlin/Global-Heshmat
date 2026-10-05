<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- entryHref is the shared resolved route builder. */
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { entryKey, entryTitle } from '$lib/utils/collection';
	import { albumBytes, albumAvailable, saveAlbum, removeAlbum } from '$lib/offline/client';
	import { csv, exportRecords, download } from '$lib/utils/exports';
	import Seo from '$lib/components/Seo.svelte';
	const fieldbook = getFieldbook();
	const browse = getBrowseStore();
	const all = [...artworks, ...residences];
	const items = $derived(all.filter((item) => fieldbook.has(item)));
	const bytes = $derived(items.reduce((sum, item) => sum + albumBytes(item), 0));
	let availability = $state<Record<string, boolean>>({});
	let busy = $state(false);
	let message = $state('');
	let cancelled = false;
	const today = () => new Date().toISOString().slice(0, 10);
	async function refresh() {
		availability = Object.fromEntries(
			await Promise.all(all.map(async (item) => [entryKey(item), await albumAvailable(item)]))
		);
	}
	onMount(() => {
		void refresh().catch(() => {});
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
	async function remove(item: (typeof all)[number]) {
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
	<div class="research-inner">
		<a href={resolve('/collection')}>Back to collection</a>
		<h2>Your fieldbook</h2>
		<p>
			Select entries from an album or add filtered collection results. Selections are stored on this
			device.
		</p>
		<p>
			Saved albums include entry text and reading-size images. Video, high-resolution images,
			external sites and new map regions need a connection. Check availability before travelling:
			browser cleanup and site updates can remove saved copies.
		</p>
		<noscript
			><p>
				Fieldbook selection and downloads require JavaScript. All collection records remain readable
				from the collection index.
			</p></noscript
		>
		{#if items.length}
			<p>
				{items.length} selected entries · estimated image download {(bytes / 1048576).toFixed(1)} MB
			</p>
			<div class="research-actions">
				<button disabled={busy || !browse.ready} onclick={() => void save()}
					>Save selected albums offline</button
				>
				{#if busy}<button
						onclick={() => {
							cancelled = true;
							message = 'Stopping after the current album…';
						}}>Stop after current album</button
					>{/if}
				<button disabled={busy} onclick={() => void refresh()}>Check availability</button>
				<button
					onclick={() =>
						download(
							JSON.stringify(exportRecords(items, today()), null, 2),
							'global-heshmat-fieldbook.json',
							'application/json'
						)}>Export JSON</button
				>
				<button
					onclick={() =>
						download(csv(items, today()), 'global-heshmat-fieldbook.csv', 'text/csv;charset=utf-8')}
					>Export CSV</button
				>
			</div>
			<ul class="fieldbook-list">
				{#each items as item (entryKey(item))}<li>
						<div>
							<a href={browse.entryHref(item, { view: 'gallery' })} dir="auto">{entryTitle(item)}</a
							>
							<p>
								{item.city}, {item.country} · {availability[entryKey(item)]
									? 'Available offline'
									: 'Download needed'}
							</p>
						</div>
						<button disabled={busy} onclick={() => void remove(item)}
							>Remove <span class="sr-only">{entryTitle(item)}</span></button
						>
					</li>{/each}
			</ul>
		{:else}<p>
				Your fieldbook is empty. <a href={resolve('/collection')}>Browse the collection</a> or
				explore <a href={resolve('/trails')}>place trails</a>.
			</p>{/if}
		<p role="status">{message || fieldbook.storageMessage}</p>
	</div>
</div>
