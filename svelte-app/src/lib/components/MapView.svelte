<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import type * as Maplibre from 'maplibre-gl';
	import { createMap, type MapHandle, type MapStatus } from '#lib/map/create-map.js';
	import { artworks } from '#lib/data/artworks.js';
	import { residences } from '#lib/data/residences.js';
	import { installMapContent, MAP_SOURCES, type MapPalette } from '#lib/map/map-content.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';
	import {
		buildEntryGeoJSON,
		buildGhostGeoJSON,
		buildRelocationGeoJSON,
		coreExtent
	} from '#lib/utils/geojson.js';
	import { locationZoom } from '#lib/utils/evidence.js';
	import { filterArtworks, filterResidences } from '#lib/utils/collection-filter.js';
	import { entryKey, type Entry } from '#lib/utils/collection.js';

	/** This map is the visible view: only then does it show its status, update its sources and move the camera. */
	let { active = true }: { active?: boolean } = $props();
	/** The width at which the legend folds on hydration (see Legend.svelte). */
	const PHONE_WIDTH = 600;
	const store = getBrowseStore();

	let maplibregl: typeof Maplibre;
	let mapContainer: HTMLDivElement;
	let handle: MapHandle | undefined;
	let map = $state<Maplibre.Map>();
	let destroyed = false;
	let lastVisibleKey: string | undefined;
	let status = $state<MapStatus>('loading');

	function reducedMotion(): boolean {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function readPalette(): MapPalette {
		const read = (name: string) =>
			getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		return {
			primary: read('--color-primary'),
			primaryRgb: read('--color-primary-rgb'),
			search: read('--color-search'),
			accent: read('--color-accent'),
			onDark: read('--color-on-dark'),
			textMuted: read('--color-text-muted'),
			residence: read('--color-residence')
		};
	}

	/**
	 * Room the camera leaves around the entries. On a phone the sides keep enough
	 * for a cluster's radius (equal ones, which keep the camera centred when a
	 * spread is wider than the map can show) and the bottom clears the folded
	 * legend and the attribution above it.
	 */
	function framePadding(): number | Maplibre.PaddingOptions {
		if (mapContainer.clientWidth > PHONE_WIDTH) return 60;
		return { top: 40, right: 44, bottom: 96, left: 44 };
	}

	/**
	 * Fit the camera to the entries. On a phone the whole collection, from the
	 * United States to Beijing, is wider than the map even at the lowest zoom its
	 * height allows, which left the markers in the top of an otherwise empty
	 * ocean. Unfiltered, a phone frames the largest group instead (Europe and
	 * Egypt) and the few far-off entries stay a pan away and in Browse; a
	 * filtered view always fits all its results.
	 */
	function fitEntries(entries: readonly Entry[], unfiltered: boolean) {
		if (!map) return;
		const phone = mapContainer.clientWidth <= PHONE_WIDTH;
		const core = phone && unfiltered ? coreExtent(entries) : undefined;
		const bounds = new maplibregl.LngLatBounds();
		if (core) bounds.extend(core);
		else for (const item of entries) bounds.extend([item.lng, item.lat]);
		map.fitBounds(bounds, {
			padding: framePadding(),
			maxZoom: 10,
			duration: reducedMotion() ? 0 : 500
		});
	}

	/** The only writer of the map's sources (installMapContent creates them empty). */
	function updateMapSource() {
		if (!active || !map || !map.getSource(MAP_SOURCES.entries)) return;
		const visibleArtworks = filterArtworks(artworks, store.filters);
		const visible: Entry[] = [...visibleArtworks, ...filterResidences(residences, store.filters)];
		// Search changes the filters on every keystroke; the sources (and the
		// camera) only need updating when the set of visible entries changes.
		const key = visible.map(entryKey).join(' ');
		if (key === lastVisibleKey) return;
		lastVisibleKey = key;
		const source = (id: string) => map!.getSource(id) as Maplibre.GeoJSONSource;
		source(MAP_SOURCES.entries).setData(buildEntryGeoJSON(visible));
		source(MAP_SOURCES.ghosts).setData(buildGhostGeoJSON(visibleArtworks));
		source(MAP_SOURCES.relocations).setData(buildRelocationGeoJSON(visibleArtworks));
		if (untrack(() => store.selectedArtwork || store.selectedResidence)) return;

		if (visible.length === 0) return;
		fitEntries(visible, visible.length === artworks.length + residences.length);
	}

	function moveTo(center: [number, number], zoom: number) {
		if (!map) return;
		const options = { center, zoom };
		if (reducedMotion()) map.jumpTo(options);
		else map.flyTo(options);
	}

	$effect(() => {
		void store.filters;
		void active;
		untrack(updateMapSource);
	});
	$effect(() => {
		const artwork = store.selectedArtwork;
		if (artwork && active) moveTo([artwork.lng, artwork.lat], locationZoom(artwork));
	});
	$effect(() => {
		const residence = store.selectedResidence;
		if (residence && active) moveTo([residence.lng, residence.lat], locationZoom(residence));
	});

	async function initialize() {
		lastVisibleKey = undefined;
		handle?.remove();
		map = undefined;
		handle = await createMap({
			container: mapContainer,
			options: { center: [20, 35], zoom: 3 },
			isDestroyed: () => destroyed,
			onStatus: (next) => (status = next),
			onError: (event) => console.error('MapLibre:', event.error?.message ?? event),
			onLoad: (instance, library) => {
				installMapContent({
					map: instance,
					maplibregl: library,
					onSelect: (item) => void goto(store.entryHref(item, { view: 'map' })),
					palette: readPalette(),
					reducedMotion,
					isDestroyed: () => destroyed
				});
				updateMapSource();
			}
		});
		if (!handle) return;
		if (destroyed) return handle.remove();
		maplibregl = handle.maplibregl;
		map = handle.map;
		handle.map.addControl(new maplibregl.NavigationControl(), 'top-right');
		handle.map.addControl(new maplibregl.GlobeControl(), 'top-right');
	}
	onMount(() => {
		void initialize();
	});

	onDestroy(() => {
		destroyed = true;
		handle?.remove();
	});

	/** On a phone this lands on the same framing as the unfiltered first view. */
	export function resetView() {
		if (map && mapContainer.clientWidth <= PHONE_WIDTH)
			fitEntries([...artworks, ...residences], true);
		else moveTo([20, 35], 3);
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>

{#if active && status !== 'ready'}
	<div
		class="map-status"
		class:map-status-failed={status === 'failed'}
		role="status"
		aria-live="polite"
	>
		{#if status === 'failed'}
			<p class="map-status-text">
				The map could not be loaded. You can still <a href={resolve('/collection')}
					>browse the gallery</a
				>.
			</p>
			<button class="map-retry" type="button" onclick={() => void initialize()}>Retry map</button>
		{:else}
			<span class="map-spinner" aria-hidden="true"></span>
			<p class="map-status-text">Loading the map&hellip;</p>
		{/if}
	</div>
{/if}

<style>
	.map-container {
		position: absolute;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		z-index: var(--z-map);
	}
	.map-status {
		position: absolute;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		z-index: var(--z-legend);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3-5);
		pointer-events: none;
		background: var(--color-surface-warm);
	}
	.map-status-failed {
		pointer-events: auto;
	}
	.map-status-text {
		max-width: 26rem;
		padding: 0 var(--space-6);
		text-align: center;
		font-size: var(--text-md);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}
	.map-spinner {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 2.5px solid var(--color-border);
		border-top-color: var(--color-primary);
		animation: map-spin 900ms linear infinite;
	}
	.map-retry {
		min-height: 44px;
		padding: 0 var(--space-4-5);
		border: 1px solid var(--color-primary-text);
		border-radius: var(--radius-pill);
		background: var(--color-primary-text);
		color: var(--color-on-dark);
		font: inherit;
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
	@keyframes map-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.map-spinner {
			animation: none;
			border-top-color: var(--color-border);
		}
	}
	.map-container :global(.ghost-popup .maplibregl-popup-content) {
		font-size: var(--text-xs);
	}
	.map-container :global(.maplibregl-ctrl-group button) {
		width: 40px;
		height: 40px;
	}
	@media (max-width: 768px) {
		.map-container :global(.maplibregl-ctrl-group button) {
			width: 44px;
			height: 44px;
		}
	}
	/* The folded legend (about 47px tall, 14px up from the bottom edge) takes
	   the bottom-left corner, and on a phone the expanded attribution runs into
	   it, so the attribution sits on a row of its own above. */
	@media (max-width: 600px) {
		.map-container :global(.maplibregl-ctrl-bottom-right) {
			bottom: calc(var(--space-3-5) + 47px + var(--space-2));
		}
	}
</style>
