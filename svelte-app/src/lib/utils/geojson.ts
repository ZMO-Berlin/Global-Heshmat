/**
 * Pure GeoJSON builders for the map layers.
 *
 * Kept out of MapView.svelte so they can be unit-tested without a WebGL
 * context, and so the component is left with camera + event wiring only.
 * The returned shapes are plain GeoJSON, consumed by MapLibre's `geojson`
 * sources; the declared return types pin the discriminant strings to literals
 * so they stay assignable to MapLibre's own literal-typed interfaces.
 */

import type { Artwork, Residence } from '$lib/data/types';

export interface FeatureCollection<G, P> {
	type: 'FeatureCollection';
	features: { type: 'Feature'; geometry: G; properties: P }[];
}

type Point = { type: 'Point'; coordinates: [number, number] };
type LineString = { type: 'LineString'; coordinates: [number, number][] };

/** Artwork points — the clustered source driving the located/search layers. */
export function buildArtworkGeoJSON(
	items: readonly Artwork[]
): FeatureCollection<
	Point,
	{ id: number; name: string; status: string; country: string; city: string }
> {
	return {
		type: 'FeatureCollection',
		features: items.map((a) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
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

/** Residence points — a separate, unclustered source with its own colour. */
export function buildResidenceGeoJSON(
	items: readonly Residence[]
): FeatureCollection<Point, { id: number; name: string; country: string; city: string }> {
	return {
		type: 'FeatureCollection',
		features: items.map((r) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
			properties: { id: r.id, name: r.name, country: r.country, city: r.city }
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
