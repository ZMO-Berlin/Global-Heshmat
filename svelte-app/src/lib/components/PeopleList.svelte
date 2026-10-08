<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- The browse store resolves internal routes. */
	import type { Person } from '$lib/data/types';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { excerptParts, groupName } from '$lib/utils/people';
	let { items }: { items: Person[] } = $props();
	const store = getBrowseStore();
</script>

<ul class="people-list">
	{#each items as person (person.slug)}
		{@const excerpt = excerptParts(person)}
		<li>
			<a href={store.personHref(person)}>{person.name}</a>
			<p class="groups">{person.groups.map(groupName).join(' · ')}</p>
			<!-- Readers took a bare ellipsis for a sentence that breaks off: point to the full text.
			     The hidden name keeps the link text descriptive (Lighthouse ignores aria-label). -->
			<p class="excerpt">
				{excerpt.text}{#if excerpt.truncated}…&nbsp;<a class="more" href={store.personHref(person)}
						>Read more<span class="sr-only">&nbsp;about {person.name}</span></a
					>{/if}
			</p>
		</li>
	{/each}
</ul>

<style>
	.people-list {
		list-style: none;
		padding: 0;
		border-top: 1px solid var(--color-border);
	}
	li {
		padding-block: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border);
	}
	li > a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-primary-text);
		font: var(--weight-semibold) var(--text-2xl) var(--font-display);
		text-underline-offset: 4px;
	}
	.groups {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-block: var(--space-1) !important;
	}
	.excerpt {
		max-width: 70ch;
		color: var(--color-text);
		line-height: var(--leading-relaxed);
		margin-block: var(--space-2) 0 !important;
	}
	.more {
		color: var(--color-primary-text);
		font-weight: var(--weight-semibold);
		white-space: nowrap;
		text-underline-offset: 3px;
	}
</style>
