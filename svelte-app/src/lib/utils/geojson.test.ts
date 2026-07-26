import { describe, expect, it } from 'vitest';
import {
	buildArtworkGeoJSON,
	buildGhostGeoJSON,
	buildRelocationGeoJSON,
	buildResidenceGeoJSON
} from './geojson';
import type { Artwork, Residence } from '$lib/data/types';

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

describe('buildArtworkGeoJSON', () => {
	it('emits lng/lat order, as GeoJSON requires', () => {
		const fc = buildArtworkGeoJSON([artwork({ lat: 30.1, lng: 31.2 })]);
		expect(fc.features[0].geometry.coordinates).toEqual([31.2, 30.1]);
	});

	it('carries the properties the map layers filter and look up on', () => {
		const fc = buildArtworkGeoJSON([artwork({ id: 7, name: 'Horus', status: 'search' })]);
		expect(fc.features[0].properties).toEqual({
			id: 7,
			name: 'Horus',
			status: 'search',
			country: 'Egypt',
			city: 'Cairo'
		});
	});

	it('returns a well-formed empty collection for no input', () => {
		expect(buildArtworkGeoJSON([])).toEqual({ type: 'FeatureCollection', features: [] });
	});
});

describe('buildResidenceGeoJSON', () => {
	it('emits one point feature per residence', () => {
		const places: Residence[] = [
			{
				id: 1,
				name: 'Selb',
				lat: 50.1,
				lng: 12.1,
				country: 'Germany',
				city: 'Selb',
				years: '1957',
				desc: ''
			}
		];
		const fc = buildResidenceGeoJSON(places);
		expect(fc.features).toHaveLength(1);
		expect(fc.features[0].geometry.coordinates).toEqual([12.1, 50.1]);
		expect(fc.features[0].properties.name).toBe('Selb');
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
