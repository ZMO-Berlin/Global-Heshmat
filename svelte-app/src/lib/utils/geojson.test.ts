import { describe, expect, it } from 'vitest';
import { buildEntryGeoJSON, buildGhostGeoJSON, buildRelocationGeoJSON } from './geojson';
import type { Artwork, IndexedArtwork, IndexedResidence } from '$lib/data/types';

const artwork = (overrides: Partial<Artwork>): Artwork => ({
	id: 1,
	name: 'Untitled',
	lat: 30,
	lng: 31,
	country: 'Egypt',
	city: 'Cairo',
	status: 'located',
	address: '',
	desc: '',
	...overrides
});

const indexed = (overrides: Partial<Artwork>): IndexedArtwork => ({
	...artwork(overrides),
	slug: 'untitled',
	kind: 'artwork'
});
const residence: IndexedResidence = {
	id: 1,
	name: 'Selb',
	lat: 50.1,
	lng: 12.1,
	country: 'Germany',
	city: 'Selb',
	years: '1957',
	desc: '',
	slug: 'selb',
	kind: 'residence'
};

describe('buildEntryGeoJSON', () => {
	it('emits lng/lat order, as GeoJSON requires', () => {
		const fc = buildEntryGeoJSON([indexed({ lat: 30.1, lng: 31.2 })]);
		expect(fc.features[0].geometry.coordinates).toEqual([31.2, 30.1]);
	});

	it('carries the properties the map layers filter and look up on', () => {
		const fc = buildEntryGeoJSON([indexed({ id: 7, name: 'Horus', status: 'search' })]);
		expect(fc.features[0].properties).toEqual({
			id: 7,
			kind: 'artwork',
			name: 'Horus',
			status: 'search',
			country: 'Egypt',
			city: 'Cairo'
		});
	});

	it('puts residences in the same source, marked by kind and status', () => {
		const fc = buildEntryGeoJSON([indexed({ id: 1 }), residence]);
		expect(
			fc.features.map((f) => [f.properties.kind, f.properties.id, f.properties.status])
		).toEqual([
			['artwork', 1, 'located'],
			['residence', 1, 'residence']
		]);
		expect(fc.features[1].geometry.coordinates).toEqual([12.1, 50.1]);
	});

	it('returns a well-formed empty collection for no input', () => {
		expect(buildEntryGeoJSON([])).toEqual({ type: 'FeatureCollection', features: [] });
	});
});

describe('buildRelocationGeoJSON', () => {
	const moved = artwork({
		id: 2,
		name: 'Intilaqat Misr',
		lat: 30,
		lng: 31,
		movement: { fromLat: 29, fromLng: 30, fromName: 'Midan Galaa', year: 1990 }
	});

	it('draws a line from the former location to the current one', () => {
		const fc = buildRelocationGeoJSON([moved]);
		expect(fc.features[0].geometry.coordinates).toEqual([
			[30, 29],
			[31, 30]
		]);
		expect(fc.features[0].properties).toEqual({ name: 'Intilaqat Misr', year: 1990 });
	});

	it('skips artworks that were never relocated', () => {
		expect(buildRelocationGeoJSON([artwork({ id: 1 }), moved]).features).toHaveLength(1);
	});
});

describe('buildGhostGeoJSON', () => {
	const moved = artwork({
		movement: { fromLat: 29, fromLng: 30, fromName: 'Midan Galaa', year: 1990 }
	});

	it('places the ghost marker at the former location', () => {
		expect(buildGhostGeoJSON([moved]).features[0].geometry.coordinates).toEqual([30, 29]);
	});

	it('labels the ghost with a "Former location" prefix for the hover tooltip', () => {
		expect(buildGhostGeoJSON([moved]).features[0].properties.name).toBe(
			'Former location: Midan Galaa'
		);
	});

	it('skips artworks that were never relocated', () => {
		expect(buildGhostGeoJSON([artwork({})]).features).toEqual([]);
	});
});
