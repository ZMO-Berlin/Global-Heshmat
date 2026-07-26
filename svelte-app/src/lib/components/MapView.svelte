<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type MaplibreNS from 'maplibre-gl';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { getMapStore } from '$lib/stores/map.svelte';
	import {
		buildArtworkGeoJSON,
		buildGhostGeoJSON,
		buildRelocationGeoJSON,
		buildResidenceGeoJSON
	} from '$lib/utils/geojson';
	import { FILTER_ALL, filterArtworks, filterResidences } from '$lib/utils/map-filter';

	const store = getMapStore();

	// `maplibre-gl` touches `window` at module load, so import it lazily inside
	// onMount to keep this component SSR-safe. Types stay imported with
	// `import type`, which is erased at compile time.
	let maplibregl: typeof MaplibreNS;
	let mapContainer: HTMLDivElement;
	// `$state` so the effects below re-run once the (async) map creation
	// finishes — on a hard load of a deep link the store is populated before
	// the map exists, and a plain variable would leave those effects dead.
	let map = $state<MaplibreNS.Map>();
	// Set when the component is torn down while onMount's awaits are still in
	// flight, so the continuations don't construct/drive a map that nothing
	// will ever clean up (a leaked WebGL context).
	let destroyed = false;
	// Drives the loading veil: the basemap style is a network fetch, so on a
	// cold or slow connection the map area would otherwise sit blank with no
	// indication anything is happening.
	let status = $state<'loading' | 'ready' | 'failed'>('loading');

	function updateMapSource() {
		// Before the style has loaded the sources don't exist yet; the map's
		// 'load' handler calls this again, so early-returning here never
		// loses an update.
		if (!map || !map.getSource('artworks')) return;
		const filtered = filterArtworks(artworks, store.activeFilter);
		const visibleResidences = filterResidences(residences, store.activeFilter);
		(map.getSource('artworks') as MaplibreNS.GeoJSONSource).setData(buildArtworkGeoJSON(filtered));
		(map.getSource('residences') as MaplibreNS.GeoJSONSource)?.setData(
			buildResidenceGeoJSON(visibleResidences)
		);

		// With a selected item the camera belongs to the pan-to-selection
		// effects — fitting bounds here would immediately yank it away
		// (e.g. on a deep-linked artwork page while the sources initialise).
		// Read untracked: the filter effect above must not re-run (and refit
		// the camera) merely because a selection opened or closed.
		if (untrack(() => store.selectedArtwork || store.selectedResidence)) return;

		// Fit bounds to everything currently visible (artworks + residences).
		const points: [number, number][] = [
			...filtered.map((a): [number, number] => [a.lng, a.lat]),
			...visibleResidences.map((r): [number, number] => [r.lng, r.lat])
		];
		if (points.length > 0) {
			const bounds = new maplibregl.LngLatBounds();
			points.forEach((p) => bounds.extend(p));
			map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
		}
	}

	// React to filter changes
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		store.activeFilter;
		updateMapSource();
	});

	// React to artwork selection (pan to it)
	$effect(() => {
		const artwork = store.selectedArtwork;
		if (artwork && map) {
			map.flyTo({ center: [artwork.lng, artwork.lat], zoom: 14 });
		}
	});

	// React to residence selection (pan to it)
	$effect(() => {
		const residence = store.selectedResidence;
		if (residence && map) {
			map.flyTo({ center: [residence.lng, residence.lat], zoom: 14 });
		}
	});

	// Read brand colours from the design-token CSS variables so the map
	// stays in sync with the legend and the rest of the UI. MapLibre paint
	// values are JSON (not CSS), so we resolve them to strings once on mount.
	function readToken(name: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	}

	onMount(async () => {
		// Dynamic import keeps maplibre out of the SSR bundle entirely.
		maplibregl = (await import('maplibre-gl')).default;
		if (destroyed) return;

		// MapLibre's WebGL renderer lays glyphs out left-to-right by default,
		// so Arabic/Persian/Hebrew basemap labels (e.g. Egyptian street names)
		// come out reversed. This ICU-based plugin shapes right-to-left text
		// correctly. It registers globally and may only be set once, so guard
		// against re-runs when the component remounts during client navigation.
		if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
			// `true` = lazy: the ~1 MB plugin is fetched only when RTL text
			// first appears in the viewport.
			maplibregl
				.setRTLTextPlugin(
					'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.4.0/dist/mapbox-gl-rtl-text.js',
					true
				)
				.catch(() => {
					// Non-fatal: if the CDN is unreachable, labels just fall
					// back to the default (unshaped) rendering rather than
					// breaking map initialisation.
				});
		}

		const colorPrimary = readToken('--color-primary');
		const colorPrimaryRgb = readToken('--color-primary-rgb');
		const colorSearch = readToken('--color-search');
		const colorAccent = readToken('--color-accent');
		const colorOnDark = readToken('--color-on-dark');
		const colorTextMuted = readToken('--color-text-muted');
		const colorResidence = readToken('--color-residence');

		// Wire everything through the local `m` (guaranteed non-undefined);
		// the `map` state assignment below is what wakes up the effects.
		const m = new maplibregl.Map({
			container: mapContainer,
			style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
			center: [20, 35],
			zoom: 3,
			attributionControl: false
		});
		map = m;

		m.addControl(new maplibregl.NavigationControl(), 'top-right');
		m.addControl(new maplibregl.GlobeControl(), 'top-right');
		m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

		m.on('error', (e) => {
			// MapLibre reports tile and style failures here. Only a missing style
			// leaves the map unusable — tile hiccups resolve themselves.
			if (!m.isStyleLoaded()) status = 'failed';
			console.error('MapLibre:', e.error?.message ?? e);
		});

		m.on('load', () => {
			status = 'ready';
			// Artwork points source
			m.addSource('artworks', {
				type: 'geojson',
				data: buildArtworkGeoJSON(filterArtworks(artworks, store.activeFilter)),
				cluster: true,
				clusterMaxZoom: 12,
				clusterRadius: 45
			});

			// Cluster circles
			m.addLayer({
				id: 'clusters',
				type: 'circle',
				source: 'artworks',
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': colorPrimary,
					'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
					'circle-opacity': 0.85,
					'circle-stroke-width': 3,
					'circle-stroke-color': `rgba(${colorPrimaryRgb.replace(/\s+/g, ',')},0.25)`
				}
			});

			// Cluster count labels
			m.addLayer({
				id: 'cluster-count',
				type: 'symbol',
				source: 'artworks',
				filter: ['has', 'point_count'],
				layout: {
					'text-field': '{point_count_abbreviated}',
					'text-font': ['Noto Sans Regular'],
					'text-size': 13
				},
				paint: {
					'text-color': colorOnDark
				}
			});

			// Located markers (unclustered)
			m.addLayer({
				id: 'artwork-located',
				type: 'circle',
				source: 'artworks',
				filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], 'located']],
				paint: {
					'circle-color': colorPrimary,
					'circle-radius': 8,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': colorOnDark
				}
			});

			// Search markers (unclustered)
			m.addLayer({
				id: 'artwork-search',
				type: 'circle',
				source: 'artworks',
				filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], 'search']],
				paint: {
					'circle-color': colorSearch,
					'circle-radius': 8,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': colorOnDark
				}
			});

			// Relocation lines
			m.addSource('relocations', {
				type: 'geojson',
				data: buildRelocationGeoJSON(artworks)
			});

			m.addLayer({
				id: 'relocation-lines',
				type: 'line',
				source: 'relocations',
				paint: {
					'line-color': colorAccent,
					'line-width': 2,
					'line-dasharray': [4, 3],
					'line-opacity': 0.8
				}
			});

			// Ghost markers (former locations)
			m.addSource('ghosts', {
				type: 'geojson',
				data: buildGhostGeoJSON(artworks)
			});

			m.addLayer({
				id: 'ghost-markers',
				type: 'circle',
				source: 'ghosts',
				paint: {
					'circle-color': 'transparent',
					'circle-radius': 7,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': colorTextMuted,
					'circle-stroke-opacity': 0.8
				}
			});

			// Places of residence — a separate, unclustered source so they read
			// as their own category (distinct colour) and never merge into the
			// artwork clusters.
			m.addSource('residences', {
				type: 'geojson',
				data: buildResidenceGeoJSON(filterResidences(residences, store.activeFilter))
			});

			m.addLayer({
				id: 'residence-markers',
				type: 'circle',
				source: 'residences',
				paint: {
					'circle-color': colorResidence,
					'circle-radius': 8,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': colorOnDark
				}
			});

			// Click on artwork point — navigate to its detail URL. The
			// /artworks/[slug]/ page sets `store.selectedArtwork`, which
			// then triggers the pan-to effect below.
			for (const layerId of ['artwork-located', 'artwork-search']) {
				m.on('click', layerId, (e) => {
					if (!e.features || e.features.length === 0) return;
					const id = e.features[0].properties.id;
					const artwork = artworks.find((a) => a.id === id);
					if (artwork) goto(resolve('/artworks/[slug]', { slug: artwork.slug }));
				});

				m.on('mouseenter', layerId, () => {
					m.getCanvas().style.cursor = 'pointer';
				});
				m.on('mouseleave', layerId, () => {
					m.getCanvas().style.cursor = '';
				});
			}

			// Click on cluster to zoom in
			m.on('click', 'clusters', async (e) => {
				const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
				if (!features.length) return;
				const clusterId = features[0].properties.cluster_id;
				const source = m.getSource('artworks') as MaplibreNS.GeoJSONSource;
				const zoom = await source.getClusterExpansionZoom(clusterId);
				if (destroyed) return;
				m.flyTo({
					center: (features[0].geometry as { type: 'Point'; coordinates: number[] })
						.coordinates as [number, number],
					zoom
				});
			});

			m.on('mouseenter', 'clusters', () => {
				m.getCanvas().style.cursor = 'pointer';
			});
			m.on('mouseleave', 'clusters', () => {
				m.getCanvas().style.cursor = '';
			});

			// Ghost marker tooltip
			const ghostPopup = new maplibregl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: 10,
				className: 'ghost-popup'
			});

			m.on('mouseenter', 'ghost-markers', (e) => {
				m.getCanvas().style.cursor = 'pointer';
				if (e.features && e.features.length > 0) {
					const coords = (
						e.features[0].geometry as { type: 'Point'; coordinates: number[] }
					).coordinates.slice() as [number, number];
					const name = e.features[0].properties.name;
					// setText (not setHTML) so the data string can never be
					// interpreted as markup; styling comes from the CSS class.
					ghostPopup.setLngLat(coords).setText(name).addTo(m);
				}
			});
			m.on('mouseleave', 'ghost-markers', () => {
				m.getCanvas().style.cursor = '';
				ghostPopup.remove();
			});

			// Click a residence marker — navigate to its detail URL. The
			// /residences/[slug]/ page sets `store.selectedResidence`, which then
			// triggers the pan-to effect above (mirrors the artwork flow).
			m.on('click', 'residence-markers', (e) => {
				if (!e.features || e.features.length === 0) return;
				const id = e.features[0].properties.id;
				const residence = residences.find((r) => r.id === id);
				if (residence) goto(resolve('/residences/[slug]', { slug: residence.slug }));
			});

			m.on('mouseenter', 'residence-markers', () => {
				m.getCanvas().style.cursor = 'pointer';
			});
			m.on('mouseleave', 'residence-markers', () => {
				m.getCanvas().style.cursor = '';
			});

			// Apply whatever store state accumulated while the style loaded —
			// on a deep link (/?filter=Egypt) the filter was set long before
			// the sources above existed. Only when the filter differs from the
			// default, so a plain visit keeps the hand-tuned initial camera.
			if (store.activeFilter !== FILTER_ALL) updateMapSource();
		});
	});

	onDestroy(() => {
		destroyed = true;
		if (map) map.remove();
	});

	export function resetView() {
		if (map) {
			map.flyTo({ center: [20, 35], zoom: 3 });
		}
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>

{#if status !== 'ready'}
	<div class="map-status" role="status" aria-live="polite">
		{#if status === 'failed'}
			<p class="map-status-text">
				The map could not be loaded. Use <strong>Browse</strong> in the header to see the collection as
				a list.
			</p>
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

	/* Sits over the map area only, so the header, filter bar and footer stay
	   interactive while the basemap loads. */
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
	@keyframes map-spin {
		to {
			transform: rotate(360deg);
		}
	}
	/* The reduced-motion block in app.css clamps animation-duration globally,
	   which would spin this at 0.01ms. Stop it outright instead. */
	@media (prefers-reduced-motion: reduce) {
		.map-spinner {
			animation: none;
			border-top-color: var(--color-border);
		}
	}

	/* MapLibre creates popup DOM outside Svelte's reach, so the ghost
	   tooltip's styling has to be a global rule scoped by its className. */
	.map-container :global(.ghost-popup .maplibregl-popup-content) {
		font-size: 12px;
	}
</style>
