<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- entryHref is the shared resolved route builder. */
	import { resolve } from '$app/paths';
	import { trails } from '$lib/data/trails';
	import { entryKey, entryTitle } from '$lib/utils/collection';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import Seo from '$lib/components/Seo.svelte';
	const browse = getBrowseStore();
	const fieldbook = getFieldbook();
	let message = $state('');
</script>

<Seo
	title="Place trails — Global Heshmat"
	description="Read geographic sequences of Global Heshmat collection entries in Selb and 10th of Ramadan City."
	path="/trails/"
/>
<div class="research-page">
	<div class="research-inner">
		<a href={resolve('/collection')}>Back to collection</a>
		<h2>Place trails</h2>
		<p>
			Follow a reading sequence through the collection, then add its records to your <a
				href={resolve('/fieldbook')}>fieldbook</a
			>. These sequences group documented places; they are not verified walking routes or promises
			of public access.
		</p>
		{#each trails as trail (trail.id)}<section class="trail" id={trail.id}>
				<h3>{trail.title}</h3>
				<p>{trail.introduction}</p>
				<ol>
					{#each trail.entries as item (entryKey(item))}<li>
							<a href={browse.entryHref(item, { view: 'gallery' })} dir="auto">{entryTitle(item)}</a
							>
						</li>{/each}
				</ol>
				<button
					disabled={!browse.ready}
					onclick={() => {
						fieldbook.add(trail.entries);
						message = `${trail.entries.length} entries added to your fieldbook.`;
					}}>Add this trail to fieldbook</button
				>
			</section>{/each}
		<p role="status">{message}</p>
	</div>
</div>
