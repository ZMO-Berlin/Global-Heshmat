<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- The browse store resolves internal routes. */
	import type { Person } from '$lib/data/types';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { groupName, personExcerpt } from '$lib/utils/people';
	let { items }: { items: Person[] } = $props();
	const store = getBrowseStore();
</script>

<ul class="people-list">
	{#each items as person (person.slug)}
		<li>
			<a href={store.personHref(person)}>{person.name}</a>
			<p class="groups">{person.groups.map(groupName).join(' · ')}</p>
			<p class="excerpt">{personExcerpt(person)}</p>
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
	a {
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
</style>
