<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type MaplibreNS from 'maplibre-gl';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import type { Artwork, Residence } from '$lib/data/types';
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

	// `maplibre-gl` touches `window` at module load, so import it lazily inside
	// onMount to keep this component SSR-safe. Types stay imported with
	// `import type`, which is erased at compile time.
	let maplibregl: typeof MaplibreNS;
	let mapContainer: HTMLDivElement;
	let map: MaplibreNS.Map;

	// Build GeoJSON from artworks
	function buildGeoJSON(items: Artwork[]) {
		return {
			type: 'FeatureCollection' as const,
			features: items.map((a) => ({
				type: 'Feature' as const,
				geometry: { type: 'Point' as const, coordinates: [a.lng, a.lat] },
				properties: {
					id: a.id,
					name: a.name,
					status: a.status,
					country: a.country,
					city: a.city
				}
			}))
		};
	}

	function buildRelocationGeoJSON() {
		return {
			type: 'FeatureCollection' as const,
			features: artworks
				.filter((a) => a.movement)
				.map((a) => ({
					type: 'Feature' as const,
					geometry: {
						type: 'LineString' as const,
						coordinates: [
							[a.movement!.fromLng, a.movement!.fromLat],
							[a.lng, a.lat]
						]
					},
					properties: {
						name: a.name,
						year: a.movement!.year
					}
				}))
		};
	}

	function buildGhostGeoJSON() {
		return {
			type: 'FeatureCollection' as const,
			features: artworks
				.filter((a) => a.movement)
				.map((a) => ({
					type: 'Feature' as const,
					geometry: {
						type: 'Point' as const,
						coordinates: [a.movement!.fromLng, a.movement!.fromLat]
					},
					properties: {
						name: 'Former location: ' + a.movement!.fromName
					}
				}))
		};
	}

	function getFilteredArtworks(): Artwork[] {
		if (store.activeFilter === 'all') return artworks;
		if (store.activeFilter === 'search') return artworks.filter((a) => a.status === 'search');
		// The "Places of residence" filter shows only residence markers (see
		// getVisibleResidences), so no artworks are plotted under it.
		if (store.activeFilter === 'residence') return [];
		return artworks.filter((a) => a.country === store.activeFilter);
	}

	// Residences show on the default "all" view and under their own "Places of
	// residence" filter. The country and "to be found" filters are artwork-only,
	// so residences hide there.
	function getVisibleResidences(): Residence[] {
		return store.activeFilter === 'all' || store.activeFilter === 'residence' ? residences : [];
	}

	function buildResidenceGeoJSON(items: Residence[]) {
		return {
			type: 'FeatureCollection' as const,
			features: items.map((r) => ({
				type: 'Feature' as const,
				geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
				properties: {
					id: r.id,
					name: r.name,
					country: r.country,
					city: r.city
				}
			}))
		};
	}

	function updateMapSource() {
		if (!map || !map.isStyleLoaded() || !map.getSource('artworks')) return;
		const filtered = getFilteredArtworks();
		const visibleResidences = getVisibleResidences();
		(map.getSource('artworks') as MaplibreNS.GeoJSONSource).setData(buildGeoJSON(filtered));
		(map.getSource('residences') as MaplibreNS.GeoJSONSource)?.setData(
			buildResidenceGeoJSON(visibleResidences)
		);

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

		map = new maplibregl.Map({
			container: mapContainer,
			style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
			center: [20, 35],
			zoom: 3,
			attributionControl: false
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');
		map.addControl(new maplibregl.GlobeControl(), 'top-right');
		map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

		map.on('load', () => {
			// Artwork points source
			map.addSource('artworks', {
				type: 'geojson',
				data: buildGeoJSON(artworks),
				cluster: true,
				clusterMaxZoom: 12,
				clusterRadius: 45
			});

			// Cluster circles
			map.addLayer({
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
			map.addLayer({
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
			map.addLayer({
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
			map.addLayer({
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
			map.addSource('relocations', {
				type: 'geojson',
				data: buildRelocationGeoJSON()
			});

			map.addLayer({
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
			map.addSource('ghosts', {
				type: 'geojson',
				data: buildGhostGeoJSON()
			});

			map.addLayer({
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
			map.addSource('residences', {
				type: 'geojson',
				data: buildResidenceGeoJSON(getVisibleResidences())
			});

			map.addLayer({
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
				map.on('click', layerId, (e) => {
					if (!e.features || e.features.length === 0) return;
					const id = e.features[0].properties.id;
					const artwork = artworks.find((a) => a.id === id);
					if (artwork) goto(resolve('/artworks/[slug]', { slug: artwork.slug! }));
				});

				map.on('mouseenter', layerId, () => {
					map.getCanvas().style.cursor = 'pointer';
				});
				map.on('mouseleave', layerId, () => {
					map.getCanvas().style.cursor = '';
				});
			}

			// Click on cluster to zoom in
			map.on('click', 'clusters', async (e) => {
				const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
				if (!features.length) return;
				const clusterId = features[0].properties.cluster_id;
				const source = map.getSource('artworks') as MaplibreNS.GeoJSONSource;
				const zoom = await source.getClusterExpansionZoom(clusterId);
				map.flyTo({
					center: (features[0].geometry as { type: 'Point'; coordinates: number[] })
						.coordinates as [number, number],
					zoom
				});
			});

			map.on('mouseenter', 'clusters', () => {
				map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'clusters', () => {
				map.getCanvas().style.cursor = '';
			});

			// Ghost marker tooltip
			const ghostPopup = new maplibregl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: 10
			});

			map.on('mouseenter', 'ghost-markers', (e) => {
				map.getCanvas().style.cursor = 'pointer';
				if (e.features && e.features.length > 0) {
					const coords = (
						e.features[0].geometry as { type: 'Point'; coordinates: number[] }
					).coordinates.slice() as [number, number];
					const name = e.features[0].properties.name;
					ghostPopup
						.setLngLat(coords)
						.setHTML(`<span style="font-size:12px">${name}</span>`)
						.addTo(map);
				}
			});
			map.on('mouseleave', 'ghost-markers', () => {
				map.getCanvas().style.cursor = '';
				ghostPopup.remove();
			});

			// Click a residence marker — navigate to its detail URL. The
			// /residences/[slug]/ page sets `store.selectedResidence`, which then
			// triggers the pan-to effect above (mirrors the artwork flow).
			map.on('click', 'residence-markers', (e) => {
				if (!e.features || e.features.length === 0) return;
				const id = e.features[0].properties.id;
				const residence = residences.find((r) => r.id === id);
				if (residence) goto(resolve('/residences/[slug]', { slug: residence.slug! }));
			});

			map.on('mouseenter', 'residence-markers', () => {
				map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'residence-markers', () => {
				map.getCanvas().style.cursor = '';
			});
		});
	});

	onDestroy(() => {
		if (map) map.remove();
	});

	export function resetView() {
		if (map) {
			map.flyTo({ center: [20, 35], zoom: 3 });
		}
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
	.map-container {
		position: absolute;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		z-index: var(--z-map);
	}
</style>
