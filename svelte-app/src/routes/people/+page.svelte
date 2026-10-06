<script lang="ts">
	import { countLabel } from '$lib/utils/text';
	import Seo from '$lib/components/Seo.svelte';
	import PeopleList from '$lib/components/PeopleList.svelte';
	import { people } from '$lib/data/people';
	import { filterPeople, groupPeople, sortPeople } from '$lib/utils/people';
	import type { PeopleSort } from '$lib/utils/url-facets';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	const store = getBrowseStore();
	const matches = $derived(sortPeople(filterPeople(people, store.filters), store.peopleSort));
	const sections = $derived(store.peopleSort === 'group' ? groupPeople(matches) : []);
</script>

<Seo
	title="People — Global Heshmat"
	description="Teachers and Political Sponsors · Collectors and Benefactors · The Selb Connection · Contemporaries and Peers"
	path="/people/"
/>
<section class="research-page" aria-labelledby="people-heading">
	<div class="research-inner people-inner">
		<h2 id="people-heading">People</h2>
		<p class="people-intro">
			In the course of her research on Hassan Heshmat, Sonja Hegasy identified the following group
			of individuals. Many are connected to one another and collectively represent important social
			and institutional constituencies. The illustration has already revealed an interesting cluster
			that had previously gone unnoticed, namely Heshmat’s contacts to the Armenian community in
			Cairo. It also brings into clearer focus the role played by political sponsors, curators, and
			private collectors as well as the connections to Germany, the Netherlands and Belgium. Hegasy
			has met and interviewed several of the individuals listed below.
		</p>
		<div class="people-toolbar">
			<p role="status">{countLabel(matches.length, 'profile')}</p>
			<label
				>Sort by
				<select
					disabled={!store.ready}
					value={store.peopleSort}
					onchange={(event) => store.setPeopleSort(event.currentTarget.value as PeopleSort)}
				>
					<option value="name-asc">Name (A–Z)</option>
					<option value="name-desc">Name (Z–A)</option>
					<option value="group">Group</option>
				</select>
			</label>
		</div>
		{#if matches.length && store.peopleSort === 'group'}
			{#each sections as { group, members } (group.id)}
				<section class="people-group" aria-labelledby="people-group-{group.id}">
					<h3 id="people-group-{group.id}">{group.name}</h3>
					<PeopleList items={members} />
				</section>
			{/each}
		{:else if matches.length}<PeopleList items={matches} />{:else}
			<h3>No people match these filters</h3>
			<p>Try another name, group or place mentioned.</p>
			<button disabled={!store.ready} onclick={() => store.resetFilters()}>Clear filters</button>
		{/if}
	</div>
</section>

<style>
	.people-group + .people-group {
		margin-top: var(--space-7);
	}
	/* Section labels, set apart from the display-serif names they introduce. */
	.people-group h3 {
		margin-bottom: var(--space-3);
		color: var(--color-accent-text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}
	.people-intro {
		max-width: 75ch;
		margin-bottom: var(--space-6);
	}
	.people-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-5);
		margin-bottom: var(--space-4);
	}
	label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-secondary);
	}
	select {
		min-height: 44px;
		max-width: 100%;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
	}
	@media (max-width: 600px) {
		.people-inner {
			padding: var(--space-4);
		}
	}
</style>
