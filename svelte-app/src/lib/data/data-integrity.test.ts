import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { artworks } from './artworks';
import { residences } from './residences';

/**
 * Cross-checks the hand-edited data files against the files actually on
 * disk, so a typo'd filename, a `.jpg`/`.jpeg` mismatch, or a forgotten
 * derivative run fails `npm test` instead of 404ing in production.
 *
 * Filenames are NFC-normalised on both sides: macOS stores umlauts in NFD,
 * so a file added there can otherwise mismatch the (NFC) string in the data
 * file even though they look identical.
 */

const STATIC_DIR = fileURLToPath(new URL('../../../static/', import.meta.url));

function fileSet(dir: string): Set<string> {
	return new Set(readdirSync(dir).map((f) => f.normalize('NFC')));
}

const originals = fileSet(`${STATIC_DIR}images`);
const webDerivatives = fileSet(`${STATIC_DIR}images/web`);
const thumbDerivatives = fileSet(`${STATIC_DIR}images/thumb`);
const videos = fileSet(`${STATIC_DIR}videos`);

/** Mirror of the stem logic in src/lib/utils/image.ts. */
const stem = (file: string) => file.replace(/\.[^./\\]+$/, '');

interface ImageRef {
	owner: string;
	file: string;
}

function imageRefs(items: ReadonlyArray<(typeof artworks)[number] | (typeof residences)[number]>) {
	const refs: ImageRef[] = [];
	for (const item of items) {
		if (item.image) refs.push({ owner: item.name, file: item.image });
		for (const img of item.images ?? []) refs.push({ owner: item.name, file: img.src });
	}
	return refs;
}

const allItems = [...artworks, ...residences];
const allImageRefs = [...imageRefs(artworks), ...imageRefs(residences)];

describe('image references', () => {
	it('every referenced image exists verbatim in static/images/', () => {
		const missing = allImageRefs
			.filter((r) => !originals.has(r.file.normalize('NFC')))
			.map((r) => `${r.owner}: ${r.file}`);
		expect(missing).toEqual([]);
	});

	it('every referenced image has web + thumb WebP derivatives', () => {
		const missing = allImageRefs
			.map((r) => ({ ...r, webp: `${stem(r.file)}.webp`.normalize('NFC') }))
			.filter((r) => !webDerivatives.has(r.webp) || !thumbDerivatives.has(r.webp))
			.map((r) => `${r.owner}: ${r.file} → ${r.webp}`);
		expect(missing).toEqual([]);
	});
});

describe('video references', () => {
	it('every referenced videoFile exists in static/videos/', () => {
		const missing = artworks
			.filter((a) => a.videoFile && !videos.has(a.videoFile.normalize('NFC')))
			.map((a) => `${a.name}: ${a.videoFile}`);
		expect(missing).toEqual([]);
	});
});

describe('identity and coordinates', () => {
	it('artwork ids are unique', () => {
		const seen = new Map<number, string>();
		for (const a of artworks) {
			expect(seen.has(a.id), `duplicate id ${a.id}: "${a.name}" vs "${seen.get(a.id)}"`).toBe(
				false
			);
			seen.set(a.id, a.name);
		}
	});

	it('residence ids are unique', () => {
		const seen = new Map<number, string>();
		for (const r of residences) {
			expect(seen.has(r.id), `duplicate id ${r.id}: "${r.name}" vs "${seen.get(r.id)}"`).toBe(
				false
			);
			seen.set(r.id, r.name);
		}
	});

	it('every item has a non-empty slug', () => {
		for (const item of allItems) {
			expect(item.slug, `"${item.name}" resolved to an empty slug`).toBeTruthy();
		}
	});

	it('coordinates are within valid ranges', () => {
		for (const item of allItems) {
			expect(item.lat, `${item.name} lat`).toBeGreaterThanOrEqual(-90);
			expect(item.lat, `${item.name} lat`).toBeLessThanOrEqual(90);
			expect(item.lng, `${item.name} lng`).toBeGreaterThanOrEqual(-180);
			expect(item.lng, `${item.name} lng`).toBeLessThanOrEqual(180);
		}
	});

	it('movement origin coordinates are within valid ranges', () => {
		for (const a of artworks) {
			if (!a.movement) continue;
			expect(a.movement.fromLat, `${a.name} fromLat`).toBeGreaterThanOrEqual(-90);
			expect(a.movement.fromLat, `${a.name} fromLat`).toBeLessThanOrEqual(90);
			expect(a.movement.fromLng, `${a.name} fromLng`).toBeGreaterThanOrEqual(-180);
			expect(a.movement.fromLng, `${a.name} fromLng`).toBeLessThanOrEqual(180);
		}
	});
});
