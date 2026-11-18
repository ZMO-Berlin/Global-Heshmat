<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- record and profile links come from the browse store's resolved builders and resolve(). */
	import { resolve } from '$app/paths';
	import MemoirPages from './MemoirPages.svelte';
	import { artworks } from '#lib/data/artworks.js';
	import { residences } from '#lib/data/residences.js';
	import { ofType, type MemoirEntity } from '#lib/data/memoir.js';
	import { linkedRecords, profiledPeople, rankPeople } from '#lib/data/memoir-view.js';
	import { entryKey, entryTitle, type Entry } from '#lib/utils/collection.js';
	import { countLabel } from '#lib/utils/text.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';

	let {
		onopen
	}: { onopen: (entity: MemoirEntity, page: number, opener: HTMLButtonElement) => void } = $props();

	const store = getBrowseStore();
	// Site records the book refers to, with the names it uses for them.
	const entries = new Map<string, Entry>([...artworks, ...residences].map((e) => [entryKey(e), e]));
	const records = linkedRecords(
		ofType('artwork').concat(ofType('organisation'), ofType('place')),
		entries
	);
	const profiled = profiledPeople(rankPeople(ofType('person')).persons);
	const profileHref = (record: string) =>
		resolve('/people/[slug]', { slug: record.slice('person:'.length) });
</script>

<section id="collection" aria-labelledby="collection-heading">
	<h3 id="collection-heading">In the collection</h3>
	<p>
		The book mentions {countLabel(records.length, 'work or site')} recorded in this collection and
		{countLabel(profiled.length, 'person', 'people')} with a profile here.
	</p>
	<ul class="records">
		{#each records as { key, entry, names, mentions } (key)}<li>
				<a href={store.entryHref(entry, { view: 'gallery' })} dir="auto">{entryTitle(entry)}</a>
				<span class="as"
					>named as {#each names as name, i (name.id)}{i ? '; ' : ''}<span dir="auto"
							>{name.name}</span
						>{/each} · {countLabel(mentions, 'mention')}</span
				>
			</li>{/each}
	</ul>
	<h4>People with a profile</h4>
	<ul class="records">
		{#each profiled as entity (entity.id)}
			<li>
				<a href={profileHref(entity.record!)} dir="auto">{entity.name}</a>
				<span class="as"
					>{countLabel(entity.mentions, 'mention')}{#if entity.pages.length}
						· <MemoirPages {entity} {onopen} />{/if}</span
				>
			</li>{/each}
	</ul>
</section>

<style>
	h4 {
		margin: var(--space-6) 0 var(--space-3);
		font: var(--weight-semibold) var(--text-sm) var(--font-body);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-accent-text);
	}
	.as {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	.records {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-3) var(--space-7);
		margin-top: var(--space-4);
	}
	.records a {
		font: var(--weight-semibold) var(--text-lg) / var(--leading-snug) var(--font-display);
	}
</style>
