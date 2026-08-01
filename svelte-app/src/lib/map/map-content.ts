import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type * as Maplibre from 'maplibre-gl';
import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import {
	buildArtworkGeoJSON,
	buildGhostGeoJSON,
	buildRelocationGeoJSON,
	buildResidenceGeoJSON
} from '$lib/utils/geojson';
import { filterArtworks, filterResidences, type MapFilter } from '$lib/utils/map-filter';
import { MARKER_IMAGE_IDS, registerMarkerIcons } from '$lib/utils/marker-icons';

export interface MapPalette {
	primary: string;
	primaryRgb: string;
	search: string;
	accent: string;
	onDark: string;
	textMuted: string;
	residence: string;
}

/** Register the archive's sources, layers, markers, and pointer interactions. */
export function installMapContent({
	map,
	maplibregl,
	activeFilter,
	palette,
	reducedMotion,
	isDestroyed
}: {
	map: Maplibre.Map;
	maplibregl: typeof Maplibre;
	activeFilter: MapFilter;
	palette: MapPalette;
	reducedMotion: () => boolean;
	isDestroyed: () => boolean;
}) {
	registerMarkerIcons(map, {
		located: palette.primary,
		search: palette.search,
		residence: palette.residence,
		former: palette.textMuted
	});

	map.addSource('artworks', {
		type: 'geojson',
		data: buildArtworkGeoJSON(filterArtworks(artworks, activeFilter)),
		cluster: true,
		clusterMaxZoom: 12,
		clusterRadius: 45
	});
	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'artworks',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': palette.primary,
			'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 10, 30],
			'circle-opacity': 0.85,
			'circle-stroke-width': 3,
			'circle-stroke-color': `rgba(${palette.primaryRgb.replace(/\s+/g, ',')},0.25)`
		}
	});
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
		paint: { 'text-color': palette.onDark }
	});

	for (const [id, status, image] of [
		['artwork-located', 'located', MARKER_IMAGE_IDS.located],
		['artwork-search', 'search', MARKER_IMAGE_IDS.search]
	] as const) {
		map.addLayer({
			id,
			type: 'symbol',
			source: 'artworks',
			filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], status]],
			layout: {
				'icon-image': image,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true
			}
		});
		map.on('click', id, (event) => {
			const artworkId = event.features?.[0]?.properties?.id;
			const artwork = artworks.find((item) => item.id === artworkId);
			if (artwork) void goto(resolve('/artworks/[slug]', { slug: artwork.slug }));
		});
		map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
		map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
	}

	map.addSource('relocations', { type: 'geojson', data: buildRelocationGeoJSON(artworks) });
	map.addLayer({
		id: 'relocation-lines',
		type: 'line',
		source: 'relocations',
		paint: {
			'line-color': palette.accent,
			'line-width': 2,
			'line-dasharray': [4, 3],
			'line-opacity': 0.8
		}
	});

	map.addSource('ghosts', { type: 'geojson', data: buildGhostGeoJSON(artworks) });
	map.addLayer({
		id: 'ghost-markers',
		type: 'symbol',
		source: 'ghosts',
		layout: {
			'icon-image': MARKER_IMAGE_IDS.former,
			'icon-allow-overlap': true,
			'icon-ignore-placement': true
		},
		paint: { 'icon-opacity': 0.85 }
	});

	map.addSource('residences', {
		type: 'geojson',
		data: buildResidenceGeoJSON(filterResidences(residences, activeFilter))
	});
	map.addLayer({
		id: 'residence-markers',
		type: 'symbol',
		source: 'residences',
		layout: {
			'icon-image': MARKER_IMAGE_IDS.residence,
			'icon-allow-overlap': true,
			'icon-ignore-placement': true
		}
	});

	map.on('click', 'clusters', async (event) => {
		const features = map.queryRenderedFeatures(event.point, { layers: ['clusters'] });
		if (!features.length) return;
		const clusterId = Number(features[0].properties?.cluster_id);
		const source = map.getSource('artworks') as Maplibre.GeoJSONSource;
		const zoom = await source.getClusterExpansionZoom(clusterId);
		if (isDestroyed()) return;
		const options = {
			center: (features[0].geometry as { type: 'Point'; coordinates: number[] }).coordinates as [
				number,
				number
			],
			zoom
		};
		if (reducedMotion()) map.jumpTo(options);
		else map.flyTo(options);
	});
	map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'));
	map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''));

	const ghostPopup = new maplibregl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 10,
		className: 'ghost-popup'
	});
	map.on('mouseenter', 'ghost-markers', (event) => {
		map.getCanvas().style.cursor = 'pointer';
		const feature = event.features?.[0];
		if (!feature) return;
		const coordinates = (
			feature.geometry as { type: 'Point'; coordinates: number[] }
		).coordinates.slice() as [number, number];
		ghostPopup
			.setLngLat(coordinates)
			.setText(String(feature.properties?.name ?? 'Former location'))
			.addTo(map);
	});
	map.on('mouseleave', 'ghost-markers', () => {
		map.getCanvas().style.cursor = '';
		ghostPopup.remove();
	});

	map.on('click', 'residence-markers', (event) => {
		const residenceId = event.features?.[0]?.properties?.id;
		const residence = residences.find((item) => item.id === residenceId);
		if (residence) void goto(resolve('/residences/[slug]', { slug: residence.slug }));
	});
	map.on('mouseenter', 'residence-markers', () => (map.getCanvas().style.cursor = 'pointer'));
	map.on('mouseleave', 'residence-markers', () => (map.getCanvas().style.cursor = ''));
}
