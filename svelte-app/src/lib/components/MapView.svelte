<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { artworks } from '$lib/data/artworks';
	import type { Artwork } from '$lib/data/types';
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;

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
		return artworks.filter((a) => a.country === store.activeFilter);
	}

	function updateMapSource() {
		if (!map || !map.isStyleLoaded() || !map.getSource('artworks')) return;
		const filtered = getFilteredArtworks();
		(map.getSource('artworks') as maplibregl.GeoJSONSource).setData(buildGeoJSON(filtered));

		// Fit bounds to filtered items
		if (filtered.length > 0) {
			const bounds = new maplibregl.LngLatBounds();
			filtered.forEach((a) => bounds.extend([a.lng, a.lat]));
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

	onMount(() => {
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
					'circle-color': '#1a8a7d',
					'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
					'circle-opacity': 0.85,
					'circle-stroke-width': 3,
					'circle-stroke-color': 'rgba(26,138,125,0.25)'
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
					'text-color': '#ffffff'
				}
			});

			// Located markers (unclustered)
			map.addLayer({
				id: 'artwork-located',
				type: 'circle',
				source: 'artworks',
				filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], 'located']],
				paint: {
					'circle-color': '#1a8a7d',
					'circle-radius': 8,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': '#ffffff'
				}
			});

			// Search markers (unclustered)
			map.addLayer({
				id: 'artwork-search',
				type: 'circle',
				source: 'artworks',
				filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], 'search']],
				paint: {
					'circle-color': '#d4842a',
					'circle-radius': 8,
					'circle-stroke-width': 2.5,
					'circle-stroke-color': '#ffffff'
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
					'line-color': '#c9963b',
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
					'circle-stroke-color': '#999',
					'circle-stroke-opacity': 0.8
				}
			});

			// Click on artwork point
			for (const layerId of ['artwork-located', 'artwork-search']) {
				map.on('click', layerId, (e) => {
					if (!e.features || e.features.length === 0) return;
					const id = e.features[0].properties.id;
					const artwork = artworks.find((a) => a.id === id);
					if (artwork) store.selectedArtwork = artwork;
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
				const source = map.getSource('artworks') as maplibregl.GeoJSONSource;
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
		z-index: 1;
	}
</style>
