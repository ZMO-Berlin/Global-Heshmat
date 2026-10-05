<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import PeopleList from '$lib/components/PeopleList.svelte';
	import { people } from '$lib/data/people';
	import { filterPeople } from '$lib/utils/people';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	const store = getBrowseStore();
	const matches = $derived(filterPeople(people, store.filters));
</script>

<Seo
	title="People — Global Heshmat"
	description="Teachers and Political Sponsors · Collectors and Benefactors · The Selb Connection · Contemporaries and Peers"
	path="/people/"
/>
<section class="research-page" aria-labelledby="people-heading">
	<div class="research-inner people-inner">
		<h2 id="people-heading">People</h2>
		<p role="status">{matches.length} {matches.length === 1 ? 'profile' : 'profiles'}</p>
		{#if matches.length}<PeopleList items={matches} />{:else}
			<h3>No people match these filters</h3>
			<p>Try another name, group or place mentioned.</p>
			<button disabled={!store.ready} onclick={() => store.resetFilters()}>Clear filters</button>
		{/if}
	</div>
</section>

<style>
	@media (max-width: 600px) {
		.people-inner {
			padding: var(--space-4);
		}
	}
</style>
