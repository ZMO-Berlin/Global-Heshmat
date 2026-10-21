<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- entryHref is the shared resolved route builder; #ids are in-page anchors. */
	import { resolve } from '$app/paths';
	import { themeTrails, placeTrails } from '$lib/data/trails';
	import { entryKey, entryTitle } from '$lib/utils/collection';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	import Seo from '$lib/components/Seo.svelte';
	const browse = getBrowseStore();
	const fieldbook = getFieldbook();
	let message = $state('');
	const groups = [
		{ id: 'themes', title: 'Themes', trails: themeTrails.filter((trail) => trail.entries.length) },
		{ id: 'places', title: 'Places', trails: placeTrails }
	];
</script>

<Seo
	title="Trails — Global Heshmat"
	description="Follow Hassan Heshmat’s work by theme or by place: industry and everyday life, state commissions, East and West, faith and remembrance, museums, Selb and more."
	path="/trails/"
/>
<div class="research-page">
	<div class="research-inner">
		<a href={resolve('/collection')}>Back to collection</a>
		<h2>Trails</h2>
		<p>
			Follow a reading sequence through the collection, then add its records to your <a
				href={resolve('/fieldbook')}>fieldbook</a
			>. Thematic trails follow one theme across many places; place trails gather the records of one
			place. They are not verified walking routes or promises of public access.
		</p>
		<nav class="trail-index" aria-label="Trails on this page">
			{#each groups as group (group.id)}<div>
					<strong>{group.title}:</strong>
					<ul>
						{#each group.trails as trail (trail.id)}<li>
								<a href="#{trail.id}">{trail.title}</a>
							</li>{/each}
					</ul>
				</div>{/each}
		</nav>
		{#each groups as group (group.id)}<section
				class="trail-group"
				aria-labelledby="{group.id}-heading"
			>
				<h3 id="{group.id}-heading">{group.title}</h3>
				{#each group.trails as trail (trail.id)}<section class="trail" id={trail.id}>
						<h4>{trail.title}</h4>
						<p>{trail.introduction}</p>
						<ol>
							{#each trail.entries as item (entryKey(item))}<li>
									<a href={browse.entryHref(item, { view: 'gallery' })} dir="auto"
										>{entryTitle(item)}</a
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
			</section>{/each}
		<p role="status">{message}</p>
	</div>
</div>
