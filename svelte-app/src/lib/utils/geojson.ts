/**
 * Pure GeoJSON builders for the map layers.
 *
 * Kept out of MapView.svelte so they can be unit-tested without a WebGL
 * context, and so the component is left with camera + event wiring only.
 * The returned shapes are plain GeoJSON, consumed by MapLibre's `geojson`
 * sources; the declared return types pin the discriminant strings to literals
 * so they stay assignable to MapLibre's own literal-typed interfaces.
 */

import type { Artwork } from '#lib/data/types.js';
import { entryStatus, type Entry, type EntryStatus } from './collection';

export interface FeatureCollection<G, P> {
	type: 'FeatureCollection';
	features: { type: 'Feature'; geometry: G; properties: P }[];
}

type Point = { type: 'Point'; coordinates: [number, number] };
type LineString = { type: 'LineString'; coordinates: [number, number][] };

export interface EntryPointProperties {
	id: number;
	kind: Entry['kind'];
	/** Selects the marker layer: located, to be found, or place of residence. */
	status: EntryStatus;
	name: string;
	country: string;
	city: string;
}

/**
 * One point per artwork and residence — the single clustered source. Residences
 * cluster with artworks so a residence diamond can never sit on top of a
 * cluster and hide its count; a cluster that contains one carries a diamond
 * badge on its rim instead (see map-content.ts). Ids are unique only per kind.
 */
export function buildEntryGeoJSON(
	items: readonly Entry[]
): FeatureCollection<Point, EntryPointProperties> {
	return {
		type: 'FeatureCollection',
		features: items.map((item) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
			properties: {
				id: item.id,
				kind: item.kind,
				status: entryStatus(item),
				name: item.name,
				country: item.country,
				city: item.city
			}
		}))
	};
}

/** Dashed lines joining a relocated artwork's former and current locations. */
export function buildRelocationGeoJSON(
	items: readonly Artwork[]
): FeatureCollection<LineString, { name: string; year: number }> {
	return {
		type: 'FeatureCollection',
		features: items
			.filter((a) => a.movement)
			.map((a) => ({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [
						[a.movement!.fromLng, a.movement!.fromLat],
						[a.lng, a.lat]
					]
				},
				properties: { name: a.name, year: a.movement!.year }
			}))
	};
}

/** Hollow "ghost" markers at the former location of a relocated artwork. */
export function buildGhostGeoJSON(
	items: readonly Artwork[]
): FeatureCollection<Point, { name: string }> {
	return {
		type: 'FeatureCollection',
		features: items
			.filter((a) => a.movement)
			.map((a) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [a.movement!.fromLng, a.movement!.fromLat]
				},
				properties: { name: `Former location: ${a.movement!.fromName}` }
			}))
	};
}

/**
 * The [west, south, east, north] extent of the largest run of points whose
 * longitudes, in order, lie no more than `maxGap` degrees apart, so that a few
 * far-off points do not decide the frame. Undefined for no points.
 */
export function coreExtent(
	points: readonly { lng: number; lat: number }[],
	maxGap = 30
): [number, number, number, number] | undefined {
	const sorted = [...points].sort((a, b) => a.lng - b.lng);
	let run: typeof sorted = [];
	let best = run;
	for (const point of sorted) {
		if (run.length && point.lng - run[run.length - 1].lng > maxGap) run = [];
		run.push(point);
		if (run.length > best.length) best = run;
	}
	if (!best.length) return undefined;
	const lats = best.map((point) => point.lat);
	return [best[0].lng, Math.min(...lats), best[best.length - 1].lng, Math.max(...lats)];
}
