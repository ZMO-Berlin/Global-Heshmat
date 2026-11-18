<script lang="ts">
	import { resolve } from '$app/paths';
	import { themeTrails, placeTrails } from '#lib/data/trails.js';
	import { entryKey } from '#lib/utils/collection.js';
	import { countLabel } from '#lib/utils/text.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';
	import { getFieldbook } from '#lib/stores/fieldbook.svelte.js';
	import Seo from '#lib/components/Seo.svelte';
	import TrailStop from '#lib/components/TrailStop.svelte';
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
	<div class="research-inner trails-inner">
		<a class="back" href={resolve('/collection')}>Back to collection</a>
		<h2>Trails</h2>
		<p class="lead">
			Follow a reading sequence through the collection, then add its records to your <a
				href={resolve('/fieldbook')}>fieldbook</a
			>. Thematic trails follow one theme across many places; place trails gather the records of one
			place. They are not verified walking routes or promises of public access.
		</p>
		<nav class="trail-index" aria-label="Trails on this page">
			{#each groups as group (group.id)}<div>
					<strong class="index-label">{group.title}</strong>
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
				{#each group.trails as trail (trail.id)}<section
						class="trail"
						id={trail.id}
						aria-labelledby="{trail.id}-heading"
					>
						<div class="trail-head">
							<h4 id="{trail.id}-heading">{trail.title}</h4>
							<p class="count">{countLabel(trail.entries.length, 'record')}</p>
							<p>{trail.introduction}</p>
							<button
								disabled={!browse.ready}
								onclick={() => {
									fieldbook.add(trail.entries);
									message = `${trail.entries.length} entries added to your fieldbook.`;
								}}>Add this trail to fieldbook</button
							>
						</div>
						<ol class="stops">
							{#each trail.entries as item, i (entryKey(item))}<TrailStop
									{item}
									step={i + 1}
								/>{/each}
						</ol>
					</section>{/each}
			</section>{/each}
		<p class="status" role="status">{message}</p>
	</div>
</div>

<style>
	.trails-inner {
		max-width: 1320px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.lead {
		max-width: 75ch;
	}
	.trail-index {
		display: grid;
		gap: var(--space-3);
		margin-block: var(--space-5) var(--space-2);
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}
	.index-label {
		display: block;
		margin-bottom: var(--space-1);
		color: var(--color-accent-text);
		font: var(--weight-semibold) var(--text-sm) var(--font-body);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}
	.trail-index ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-5);
		list-style: none;
	}
	.trail-index a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.trail-group > h3 {
		margin-top: var(--space-8);
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--color-accent);
		font-size: var(--text-3xl);
	}
	.trail {
		display: grid;
		gap: var(--space-4);
		padding-block: var(--space-6);
		scroll-margin-top: var(--space-4);
	}
	.trail + .trail {
		border-top: 1px solid var(--color-border);
	}
	.trail-head h4 {
		font: var(--weight-semibold) var(--text-2xl) / var(--leading-tight) var(--font-display);
		color: var(--color-ink);
	}
	.trail-head .count {
		margin-block: var(--space-1) 0;
		color: var(--color-accent-text);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
	}
	.trail-head p {
		max-width: 65ch;
	}
	.trail-head button {
		border-radius: var(--radius-pill);
		padding-inline: var(--space-5);
		background: var(--color-primary-text);
		border-color: var(--color-primary-text);
		color: var(--color-on-dark);
		font-weight: var(--weight-medium);
	}
	.trail-head button:hover:not(:disabled) {
		opacity: 0.9;
	}
	.trail-head button:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.stops {
		display: grid;
		gap: var(--space-2);
		list-style: none;
	}
	.status:empty {
		margin: 0;
	}
	@media (min-width: 600px) {
		.stops {
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
			gap: var(--space-3);
		}
	}
	@media (min-width: 1000px) {
		.trail-index {
			grid-template-columns: auto 1fr;
			column-gap: var(--space-6);
		}
		.trail-index > div {
			display: contents;
		}
		.index-label {
			margin: 0;
			align-self: center;
		}
		/* The introduction stays beside a long sequence while it scrolls past. */
		.trail {
			grid-template-columns: minmax(240px, 300px) 1fr;
			gap: var(--space-7);
			align-items: start;
		}
		.trail-head {
			position: sticky;
			top: var(--space-4);
		}
	}
	@media (max-width: 600px) {
		.trails-inner {
			padding: var(--space-4);
		}
	}
</style>
