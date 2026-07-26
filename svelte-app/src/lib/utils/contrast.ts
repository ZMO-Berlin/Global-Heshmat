/**
 * WCAG 2.1 relative-luminance and contrast-ratio maths.
 *
 * Exists so the palette's accessibility can be asserted in the test suite
 * (see contrast.test.ts) rather than re-checked by hand whenever a colour
 * moves. Not used at runtime — the tokens are static CSS.
 */

export type Rgb = [number, number, number];

/** Parse a `#rrggbb` string into an RGB triplet. */
export function parseHex(hex: string): Rgb {
	const h = hex.replace('#', '');
	if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Not a 6-digit hex colour: "${hex}"`);
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

/** WCAG relative luminance of an sRGB colour. */
export function luminance([r, g, b]: Rgb): number {
	const channel = (c: number) => {
		const v = c / 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two opaque colours, from 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * Composite a translucent foreground over an opaque background — the actual
 * colour a `rgb(… / alpha)` declaration produces, which is what contrast must
 * be measured against.
 */
export function over(fg: Rgb, bg: Rgb, alpha: number): Rgb {
	return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as Rgb;
}
