<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PeopleList from '$lib/components/PeopleList.svelte';
	import { people } from '$lib/data/people';
	import { filterPeople, sortPeople } from '$lib/utils/people';
	import type { PeopleSort } from '$lib/utils/url-facets';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	const store = getBrowseStore();
	const matches = $derived(sortPeople(filterPeople(people, store.filters), store.peopleSort));
</script>

<Seo
	title="People — Global Heshmat"
	description="Teachers and Political Sponsors · Collectors and Benefactors · The Selb Connection · Contemporaries and Peers"
	path="/people/"
/>
<section class="research-page" aria-labelledby="people-heading">
	<div class="research-inner people-inner">
		<h2 id="people-heading">People</h2>
		<div class="people-toolbar">
			<p role="status">{matches.length} {matches.length === 1 ? 'profile' : 'profiles'}</p>
			<label
				>Sort by
				<select
					disabled={!store.ready}
					value={store.peopleSort}
					onchange={(event) => store.setPeopleSort(event.currentTarget.value as PeopleSort)}
				>
					<option value="original">Original order</option>
					<option value="name-asc">Name (A–Z)</option>
					<option value="name-desc">Name (Z–A)</option>
				</select>
			</label>
		</div>
		{#if matches.length}<PeopleList items={matches} />{:else}
			<h3>No people match these filters</h3>
			<p>Try another name, group or place mentioned.</p>
			<button disabled={!store.ready} onclick={() => store.resetFilters()}>Clear filters</button>
		{/if}
	</div>
</section>

<style>
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
