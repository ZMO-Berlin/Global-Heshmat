<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Internal links are resolved centrally by browse.svelte.ts; source links are external. */
	import { onDestroy, onMount, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import 'maplibre-gl/dist/maplibre-gl.css';
	// MapLibre v6 is ESM-only and resolves its worker from `import.meta.url`, which
	// bundlers cannot statically analyse. Vite emits the worker as an asset here and
	// `setWorkerUrl` points MapLibre at it; without this the worker 404s in the build.
	import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	// Self-hosted Arabic shaping, emitted with a content hash under /_app/immutable/
	// so the service worker can keep it across deployments.
	import rtlTextPluginUrl from '$rtl-text-plugin?url';
	import type * as Maplibre from 'maplibre-gl';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { installMapContent, MAP_SOURCES, type MapPalette } from '$lib/map/map-content';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { buildEntryGeoJSON, buildGhostGeoJSON, buildRelocationGeoJSON } from '$lib/utils/geojson';
	import { locationZoom } from '$lib/utils/evidence';
	import { filterArtworks, filterResidences } from '$lib/utils/map-filter';
	import { entryKey, type Entry } from '$lib/utils/collection';

	let { showStatus = true }: { showStatus?: boolean } = $props();
	const store = getBrowseStore();

	let maplibregl: typeof Maplibre;
	let mapContainer: HTMLDivElement;
	let map = $state<Maplibre.Map>();
	let destroyed = false;
	let lastVisibleKey: string | undefined;
	let loadTimeout: ReturnType<typeof setTimeout> | undefined;
	let status = $state<'loading' | 'ready' | 'failed'>('loading');

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

	/** The only writer of the map's sources (installMapContent creates them empty). */
	function updateMapSource() {
		if (!showStatus || !map || !map.getSource(MAP_SOURCES.entries)) return;
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
		const bounds = new maplibregl.LngLatBounds();
		for (const item of visible) bounds.extend([item.lng, item.lat]);
		map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: reducedMotion() ? 0 : 500 });
	}

	function moveTo(center: [number, number], zoom: number) {
		if (!map) return;
		const options = { center, zoom };
		if (reducedMotion()) map.jumpTo(options);
		else map.flyTo(options);
	}

	$effect(() => {
		void store.filters;
		void showStatus;
		untrack(updateMapSource);
	});
	$effect(() => {
		const artwork = store.selectedArtwork;
		if (artwork && showStatus) moveTo([artwork.lng, artwork.lat], locationZoom(artwork));
	});
	$effect(() => {
		const residence = store.selectedResidence;
		if (residence && showStatus) moveTo([residence.lng, residence.lat], locationZoom(residence));
	});

	async function initialize() {
		status = 'loading';
		lastVisibleKey = undefined;
		if (loadTimeout) clearTimeout(loadTimeout);
		map?.remove();
		map = undefined;
		try {
			maplibregl = await import('maplibre-gl');
			if (destroyed) return;
			maplibregl.setWorkerUrl(workerUrl);

			if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
				void maplibregl.setRTLTextPlugin(rtlTextPluginUrl, true).catch(() => {
					// The basemap remains usable if optional RTL shaping cannot initialise.
				});
			}

			const instance = new maplibregl.Map({
				container: mapContainer,
				style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
				center: [20, 35],
				zoom: 3,
				attributionControl: false
			});
			map = instance;
			instance.addControl(new maplibregl.NavigationControl(), 'top-right');
			instance.addControl(new maplibregl.GlobeControl(), 'top-right');
			instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
			// Some network failures stall before MapLibre emits an error. Do not
			// leave visitors behind an indefinite spinner when the external style
			// endpoint is unavailable.
			loadTimeout = setTimeout(() => {
				if (!instance.isStyleLoaded()) status = 'failed';
			}, 15_000);

			instance.on('error', (event) => {
				if (!instance.isStyleLoaded()) {
					status = 'failed';
					if (loadTimeout) clearTimeout(loadTimeout);
				}
				console.error('MapLibre:', event.error?.message ?? event);
			});
			instance.on('load', () => {
				if (loadTimeout) clearTimeout(loadTimeout);
				status = 'ready';
				installMapContent({
					map: instance,
					maplibregl,
					onSelect: (item) => void goto(store.entryHref(item, { view: 'map' })),
					palette: readPalette(),
					reducedMotion,
					isDestroyed: () => destroyed
				});
				updateMapSource();
			});
		} catch {
			if (!destroyed) status = 'failed';
		}
	}
	onMount(() => {
		void initialize();
	});

	onDestroy(() => {
		destroyed = true;
		if (loadTimeout) clearTimeout(loadTimeout);
		map?.remove();
	});

	export function resetView() {
		moveTo([20, 35], 3);
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>

{#if showStatus && status !== 'ready'}
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
</style>
