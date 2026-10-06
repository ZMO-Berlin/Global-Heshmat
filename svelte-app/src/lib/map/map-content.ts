import type { Entry } from '$lib/utils/collection';
import type * as Maplibre from 'maplibre-gl';
import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
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

/** The sources MapView fills (and refills on each filter change) via setData. */
export const MAP_SOURCES = {
	entries: 'entries',
	relocations: 'relocations',
	ghosts: 'ghosts'
} as const;

/** Cluster circle radius steps by entry count; the residence badge sits on this rim. */
const CLUSTER_RADII = [18, 24, 30] as const;
const BADGE_SIZE = 0.75;
/** Upper-right point of the rim (45°), in icon units: icon-offset scales with icon-size. */
function rim(radius: number): ['literal', [number, number]] {
	const offset = Math.round((radius * Math.SQRT1_2) / BADGE_SIZE);
	return ['literal', [offset, -offset]];
}
/** Unclustered points of one marker status. */
function unclustered(status: 'located' | 'search' | 'residence'): Maplibre.FilterSpecification {
	return ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], status]];
}

/**
 * Register the archive's sources, layers, markers, and pointer interactions.
 * Sources start empty: MapView's updateMapSource() is their only writer.
 */
export function installMapContent({
	map,
	maplibregl,
	onSelect,
	palette,
	reducedMotion,
	isDestroyed
}: {
	map: Maplibre.Map;
	maplibregl: typeof Maplibre;
	onSelect: (item: Entry) => void;
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
	const empty = () => ({ type: 'FeatureCollection' as const, features: [] });

	// Relocation context sits beneath the entries: at world zoom a former-location
	// ring would otherwise cover a cluster count, as residence diamonds once did.
	map.addSource(MAP_SOURCES.relocations, { type: 'geojson', data: empty() });
	map.addLayer({
		id: 'relocation-lines-glow',
		type: 'line',
		source: MAP_SOURCES.relocations,
		paint: {
			'line-color': palette.accent,
			'line-width': 5,
			'line-blur': 2,
			'line-opacity': 0.25
		}
	});
	map.addLayer({
		id: 'relocation-lines',
		type: 'line',
		source: MAP_SOURCES.relocations,
		paint: {
			'line-color': palette.accent,
			'line-width': 2,
			'line-dasharray': [4, 3],
			'line-opacity': 0.9
		}
	});

	map.addSource(MAP_SOURCES.ghosts, { type: 'geojson', data: empty() });
	map.addLayer({
		id: 'ghost-markers',
		type: 'symbol',
		source: MAP_SOURCES.ghosts,
		layout: {
			'icon-image': MARKER_IMAGE_IDS.former,
			'icon-allow-overlap': true,
			'icon-ignore-placement': true
		},
		paint: { 'icon-opacity': 0.85 }
	});

	// Artworks and residences share one clustered source. Drawn separately, a
	// residence diamond sat on top of the cluster around it and hid its count;
	// now a cluster that contains a residence carries a diamond on its rim.
	map.addSource(MAP_SOURCES.entries, {
		type: 'geojson',
		data: empty(),
		cluster: true,
		clusterMaxZoom: 12,
		clusterRadius: 45,
		clusterProperties: {
			residences: ['+', ['case', ['==', ['get', 'kind'], 'residence'], 1, 0]]
		}
	});
	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: MAP_SOURCES.entries,
		filter: ['has', 'point_count'],
		paint: {
			// A cluster of residences only takes the residence colour; the badge
			// carries the same meaning by shape.
			'circle-color': [
				'case',
				['==', ['get', 'residences'], ['get', 'point_count']],
				palette.residence,
				palette.primary
			],
			'circle-radius': [
				'step',
				['get', 'point_count'],
				CLUSTER_RADII[0],
				5,
				CLUSTER_RADII[1],
				10,
				CLUSTER_RADII[2]
			],
			'circle-opacity': 0.85,
			'circle-stroke-width': 3,
			'circle-stroke-color': `rgba(${palette.primaryRgb.replace(/\s+/g, ',')},0.25)`
		}
	});
	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: MAP_SOURCES.entries,
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['Noto Sans Regular'],
			'text-size': 13
		},
		paint: { 'text-color': palette.onDark }
	});
	map.addLayer({
		id: 'cluster-residence-badge',
		type: 'symbol',
		source: MAP_SOURCES.entries,
		filter: ['all', ['has', 'point_count'], ['>', ['get', 'residences'], 0]],
		layout: {
			'icon-image': MARKER_IMAGE_IDS.residence,
			'icon-size': BADGE_SIZE,
			'icon-offset': [
				'step',
				['get', 'point_count'],
				rim(CLUSTER_RADII[0]),
				5,
				rim(CLUSTER_RADII[1]),
				10,
				rim(CLUSTER_RADII[2])
			],
			'icon-allow-overlap': true,
			'icon-ignore-placement': true
		}
	});

	for (const [id, status] of [
		['artwork-located', 'located'],
		['artwork-search', 'search']
	] as const) {
		map.addLayer({
			id,
			type: 'symbol',
			source: MAP_SOURCES.entries,
			filter: unclustered(status),
			layout: {
				'icon-image': MARKER_IMAGE_IDS[status],
				'icon-allow-overlap': true,
				'icon-ignore-placement': true
			}
		});
		map.on('click', id, (event) => {
			const artworkId = event.features?.[0]?.properties?.id;
			const artwork = artworks.find((item) => item.id === artworkId);
			if (artwork) onSelect(artwork);
		});
		map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
		map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
	}

	// Unclustered residences are drawn above unclustered artworks, as before.
	map.addLayer({
		id: 'residence-markers',
		type: 'symbol',
		source: MAP_SOURCES.entries,
		filter: unclustered('residence'),
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
		const source = map.getSource(MAP_SOURCES.entries) as Maplibre.GeoJSONSource;
		let zoom: number;
		try {
			zoom = await source.getClusterExpansionZoom(clusterId);
		} catch {
			return;
		}
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
		if (residence) onSelect(residence);
	});
	map.on('mouseenter', 'residence-markers', () => (map.getCanvas().style.cursor = 'pointer'));
	map.on('mouseleave', 'residence-markers', () => (map.getCanvas().style.cursor = ''));
}
