import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { contrastRatio, over, parseHex, type Rgb } from './contrast';

/**
 * Locks the palette's text colours to WCAG AA (4.5:1 for normal text).
 *
 * Colour values are read out of tokens.css rather than duplicated here, so
 * editing a token is what this test actually checks. Before these were pinned,
 * seven text pairings sat below AA — the worst, the "Image coming soon"
 * placeholder, at 1.45:1.
 *
 * Non-text uses of the brand hues (map markers, borders, rules) are
 * deliberately NOT covered: contrast minimums apply to glyphs, and the marker
 * palette is tuned for the map.
 */

const TOKENS = readFileSync(fileURLToPath(new URL('../../tokens.css', import.meta.url)), 'utf8');

/** Read a `--name: #rrggbb;` declaration out of tokens.css. */
function token(name: string): Rgb {
	const match = TOKENS.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
	if (!match) throw new Error(`No hex token --${name} found in tokens.css`);
	return parseHex(match[1]);
}

/** Read an `--name: N N N;` RGB triplet declaration. */
function tripletToken(name: string): Rgb {
	const match = TOKENS.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*;`));
	if (!match) throw new Error(`No triplet token --${name} found in tokens.css`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

const AA = 4.5;

const WHITE: Rgb = [255, 255, 255];
const surfaceWarm = token('color-surface-warm');
const surfaceImage = token('color-surface-image');
const headerBg = tripletToken('color-header-bg-rgb');

describe('token parsing', () => {
	it('reads hex tokens out of tokens.css', () => {
		expect(token('color-surface')).toEqual(WHITE);
	});

	it('reads RGB-triplet tokens out of tokens.css', () => {
		expect(tripletToken('color-header-bg-rgb')).toHaveLength(3);
	});
});

describe('body and UI text meets WCAG AA on light surfaces', () => {
	const cases: [string, Rgb, Rgb][] = [
		['--color-text on white', token('color-text'), WHITE],
		['--color-text-secondary on white', token('color-text-secondary'), WHITE],
		['--color-text-muted on white', token('color-text-muted'), WHITE],
		['--color-text-muted on surface-warm', token('color-text-muted'), surfaceWarm],
		['--color-text-placeholder on surface-image', token('color-text-placeholder'), surfaceImage]
	];

	for (const [label, fg, bg] of cases) {
		it(label, () => {
			expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA);
		});
	}
});

describe('brand colours used as text meet WCAG AA', () => {
	const cases: [string, Rgb, Rgb][] = [
		['--color-primary-text as a link on white', token('color-primary-text'), WHITE],
		['--color-primary-text on surface-warm', token('color-primary-text'), surfaceWarm],
		[
			'--color-primary-text on its .tag-located tint',
			token('color-primary-text'),
			token('color-primary-light')
		],
		[
			'--color-search-text on its .tag-search tint',
			token('color-search-text'),
			token('color-search-light')
		],
		[
			'--color-moved-text on its .tag-moved tint',
			token('color-moved-text'),
			token('color-moved-light')
		],
		['--color-accent-text on white', token('color-accent-text'), WHITE],
		['--color-accent-text on surface-warm', token('color-accent-text'), surfaceWarm]
	];

	for (const [label, fg, bg] of cases) {
		it(label, () => {
			expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA);
		});
	}

	it('white chip labels on the active filter fills', () => {
		expect(contrastRatio(WHITE, token('color-primary-text'))).toBeGreaterThanOrEqual(AA);
		expect(contrastRatio(WHITE, token('color-search-text'))).toBeGreaterThanOrEqual(AA);
	});

	it('the .tag-residence tint, derived at 12% over white', () => {
		const residence = tripletToken('color-residence-rgb');
		expect(contrastRatio(residence, over(residence, WHITE, 0.12))).toBeGreaterThanOrEqual(AA);
	});
});

describe('text on the dark chrome meets WCAG AA', () => {
	it('--color-header-text on the navy header', () => {
		expect(contrastRatio(tripletToken('color-header-text-rgb'), headerBg)).toBeGreaterThanOrEqual(
			AA
		);
	});

	it('--color-accent on the navy header (h1 accent, footer role labels)', () => {
		expect(contrastRatio(tripletToken('color-accent-rgb'), headerBg)).toBeGreaterThanOrEqual(AA);
	});

	it('the header subtitle at 65% opacity', () => {
		const subtitle = over(tripletToken('color-header-text-rgb'), headerBg, 0.65);
		expect(contrastRatio(subtitle, headerBg)).toBeGreaterThanOrEqual(AA);
	});

	it('the lightbox caption at 70% and counter at 60% over the scrim', () => {
		expect(contrastRatio(over(WHITE, headerBg, 0.7), headerBg)).toBeGreaterThanOrEqual(AA);
		expect(contrastRatio(over(WHITE, headerBg, 0.6), headerBg)).toBeGreaterThanOrEqual(AA);
	});
});

describe('contrast maths', () => {
	it('gives 21:1 for black on white', () => {
		expect(contrastRatio([0, 0, 0], WHITE)).toBeCloseTo(21, 5);
	});

	it('gives 1:1 for a colour against itself', () => {
		expect(contrastRatio([18, 52, 86], [18, 52, 86])).toBeCloseTo(1, 5);
	});

	it('is symmetric in its arguments', () => {
		expect(contrastRatio([10, 20, 30], WHITE)).toBeCloseTo(contrastRatio(WHITE, [10, 20, 30]), 10);
	});

	it('composites a fully opaque foreground to itself', () => {
		expect(over([10, 20, 30], WHITE, 1)).toEqual([10, 20, 30]);
	});

	it('composites a fully transparent foreground to the background', () => {
		expect(over([10, 20, 30], WHITE, 0)).toEqual(WHITE);
	});

	it('rejects a malformed hex string', () => {
		expect(() => parseHex('#12345')).toThrow(/hex/);
	});
});
