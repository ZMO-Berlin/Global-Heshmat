import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MARKER_IMAGE_IDS, MARKER_SPECS, type MarkerKind } from './marker-icons';
import { contrastRatio, over, parseHex, type Rgb } from './contrast';

const KINDS = Object.keys(MARKER_SPECS) as MarkerKind[];

describe('marker specs', () => {
	it('gives every marker kind a distinct shape', () => {
		// The whole point of the redesign: shape, not colour, is what separates
		// the categories. Two kinds sharing a shape would silently undo that.
		const shapes = KINDS.map((k) => MARKER_SPECS[k].shape);
		expect(new Set(shapes).size).toBe(shapes.length);
	});

	it('gives every marker kind a distinct colour token', () => {
		const tokens = KINDS.map((k) => MARKER_SPECS[k].colorToken);
		expect(new Set(tokens).size).toBe(tokens.length);
	});

	it('gives every marker kind a legend label', () => {
		for (const kind of KINDS) {
			expect(MARKER_SPECS[kind].label.trim(), kind).not.toBe('');
		}
	});

	it('has a map image id for every kind, all distinct', () => {
		const ids = KINDS.map((k) => MARKER_IMAGE_IDS[k]);
		expect(ids.filter(Boolean)).toHaveLength(KINDS.length);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('marker colour tokens', () => {
	const TOKENS = readFileSync(fileURLToPath(new URL('../../tokens.css', import.meta.url)), 'utf8');

	function resolve(token: string): Rgb {
		const hex = TOKENS.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
		if (hex) return parseHex(hex[1]);
		const triplet = TOKENS.match(new RegExp(`${token}-rgb:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*;`));
		if (triplet) return [Number(triplet[1]), Number(triplet[2]), Number(triplet[3])];
		throw new Error(`No token ${token} in tokens.css`);
	}

	it('every referenced token actually exists in tokens.css', () => {
		for (const kind of KINDS) {
			expect(() => resolve(MARKER_SPECS[kind].colorToken), kind).not.toThrow();
		}
	});

	it('each marker separates from its white halo, so the shape stays readable', () => {
		// The halo is what lifts a marker off the basemap; if a fill sits too
		// close to white the outline disappears and so does the shape.
		const WHITE: Rgb = [255, 255, 255];
		for (const kind of KINDS) {
			expect(contrastRatio(resolve(MARKER_SPECS[kind].colorToken), WHITE), kind).toBeGreaterThan(
				2.5
			);
		}
	});

	it('the ring marker keeps its core dot visible against the pale centre', () => {
		const centre = over(resolve('--color-search'), [255, 255, 255], 0);
		expect(contrastRatio(resolve('--color-search'), centre)).toBeGreaterThan(2.5);
	});
});
