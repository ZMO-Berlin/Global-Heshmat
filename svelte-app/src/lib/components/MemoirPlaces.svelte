<script lang="ts">
	import { onMount } from 'svelte';
	import MemoirPages from './MemoirPages.svelte';
	import { ofType, type MemoirEntity } from '#lib/data/memoir.js';
	import { splitPlaces } from '#lib/data/memoir-view.js';
	import { countLabel } from '#lib/utils/text.js';

	let {
		onopen
	}: { onopen: (entity: MemoirEntity, page: number, opener: HTMLButtonElement) => void } = $props();

	const { places, mapped, wider } = splitPlaces(ofType('place'));

	// MapLibre is a large optional renderer (about 1 MB of script): it loads only
	// once the map scrolls into view. On phones the map starts just below the fold,
	// so no margin ahead: any would load it with the page.
	type MapConstructor = (typeof import('./MemoirMap.svelte'))['default'];
	let MemoirMap = $state<MapConstructor>();
	let mapFailed = $state(false);
	let mapFrame: HTMLDivElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				import('./MemoirMap.svelte')
					.then((module) => (MemoirMap = module.default))
					.catch(() => (mapFailed = true));
			},
			// The page scrolls inside its own container.
			{ root: mapFrame.closest('.research-page') }
		);
		observer.observe(mapFrame);
		return () => observer.disconnect();
	});

	const osmUrl = (osm: string) => `https://www.openstreetmap.org/${osm}`;
	const levelLabel: Record<string, string> = {
		country: 'country',
		region: 'region',
		city: 'city',
		district: 'district',
		street: 'street or square',
		site: 'site'
	};
</script>

<section id="places" aria-labelledby="places-heading">
	<h3 id="places-heading">Places</h3>
	<p>
		{countLabel(
			mapped.length,
			'city, district, street or site',
			'cities, districts, streets and sites'
		)}
		the book names, each circle sized by how often. Select one for its pages. Positions are automatic
		and approximate.
	</p>
	<div class="map-frame" bind:this={mapFrame}>
		{#if MemoirMap}<MemoirMap places={mapped} />{:else if mapFailed}<p class="map-note">
				The map could not be loaded. Every place is also listed below.
			</p>{/if}
	</div>
	<h4>Countries and regions</h4>
	<ul class="chips">
		{#each wider as place (place.id)}<li>
				<span dir="auto">{place.name}</span>
				<span class="count" aria-label={countLabel(place.mentions, 'mention')}
					>{place.mentions}</span
				>
			</li>{/each}
	</ul>
	<details>
		<summary>All {places.length} places, with their pages</summary>
		<table>
			<thead
				><tr
					><th scope="col">Place</th><th scope="col">Arabic</th><th scope="col">Kind</th><th
						scope="col">Mentions</th
					><th scope="col">Book pages</th></tr
				></thead
			>
			<tbody>
				{#each places as place (place.id)}<tr>
						<th scope="row" dir="auto"
							>{#if place.osm}<a href={osmUrl(place.osm)} rel="external">{place.name}</a
								>{:else}{place.name}{/if}</th
						>
						<td lang="ar" dir="rtl">{place.nameAr}</td>
						<td>{place.level ? levelLabel[place.level] : 'not located'}</td>
						<td class="num">{place.mentions}</td>
						<td><MemoirPages entity={place} shown={12} {onopen} /></td>
					</tr>{/each}
			</tbody>
		</table>
	</details>
</section>

<style>
	h4 {
		margin: var(--space-6) 0 var(--space-3);
		font: var(--weight-semibold) var(--text-sm) var(--font-body);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-accent-text);
	}
	.map-frame {
		position: relative;
		height: clamp(320px, 55vh, 520px);
		margin-top: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface-image);
	}
	:global(.research-inner) .map-note {
		padding: var(--space-5);
		text-align: center;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
	}
	.chips li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-1) var(--space-1) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		font-size: var(--text-sm);
	}
	.count {
		min-width: 1.75em;
		padding: 0 var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--color-accent-light);
		color: var(--color-accent-text);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	details {
		margin-top: var(--space-5);
	}
	summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		color: var(--color-primary-text);
		cursor: pointer;
	}
	table {
		width: 100%;
		margin-top: var(--space-3);
		border-collapse: collapse;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: var(--space-2) var(--space-3) var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-light);
		text-align: start;
		vertical-align: baseline;
	}
	thead th {
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
	}
	tbody th {
		font-weight: var(--weight-medium);
	}
	td[lang='ar'] {
		font-size: var(--text-base);
	}
	.num {
		text-align: end;
	}
	@media (max-width: 600px) {
		table thead {
			display: none;
		}
		table,
		tbody,
		tr,
		th,
		td {
			display: block;
		}
		tr {
			padding-block: var(--space-2);
			border-bottom: 1px solid var(--color-border-light);
		}
		th,
		td {
			padding: 0;
			border: 0;
		}
	}
</style>
