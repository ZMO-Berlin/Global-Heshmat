/**
 * Map a stored artwork image filename to its generated WebP derivatives.
 *
 * Originals are archived in `originals/` (outside `static/`, so they never
 * ship in the deployed site). `scripts/generate_image_derivatives.mjs` writes
 * three downscaled WebP copies per image, keeping the original's stem and
 * swapping the extension for `.webp`:
 *
 *   thumb/   400px — thumbnail strips
 *   web/    1200px — the sidebar gallery, and the small srcset candidate
 *   full/   2000px — the lightbox on large and high-DPI displays
 *
 * Because the mapping strips the extension, a data/disk mismatch such as
 * `"photo.jpg"` vs `photo.jpeg` resolves to the same `photo.webp` either way.
 * The data-integrity test (`src/lib/data/data-integrity.test.ts`) and
 * `npm run verify:build` both fail when a referenced image has no derivative,
 * so the app can rely on these URLs resolving.
 */

/** Intrinsic widths of the derivatives, for `srcset` descriptors. */
export const IMAGE_WIDTHS = { thumb: 400, web: 1200, full: 2000 } as const;

/**
 * Strip the extension and percent-encode the result.
 *
 * Encoding is not optional here. 50 of the 139 filenames in this archive
 * contain spaces, and a space inside a `srcset` URL terminates the URL — the
 * rest is read as the width descriptor, so the candidate is invalid and the
 * browser silently drops it. Others carry umlauts or a backtick. Encoding the
 * segment makes the URL valid in `src`, `srcset` and the sitemap alike.
 *
 * NFC normalisation matters just as much. Ten of these filenames were written
 * on macOS, which stores "ä" decomposed (a + U+0308). Percent-encoding that
 * decomposed form yields %CC%88, and a static host that resolves paths in NFC
 * answers 404 — so those images silently vanished while every check passed,
 * because the integrity test normalises both sides before comparing.
 */
function encodedStem(file: string): string {
	return encodeURIComponent(file.normalize('NFC').replace(/\.[^./\\]+$/, ''));
}

/** URL for the small WebP thumbnail (gallery / lightbox thumb strips). */
export function thumbUrl(src: string): string {
	return `/images/thumb/${encodedStem(src)}.webp`;
}

/** URL for the 1200px WebP derivative (sidebar gallery). */
export function webUrl(src: string): string {
	return `/images/web/${encodedStem(src)}.webp`;
}

/** URL for the 2000px WebP derivative (lightbox on large / high-DPI screens). */
export function fullUrl(src: string): string {
	return `/images/full/${encodedStem(src)}.webp`;
}

/**
 * A `srcset` offering both the 1200px and 2000px derivatives, so the browser
 * fetches the larger master only where it actually helps (a wide viewport or a
 * high-DPI screen). Pair with a `sizes` attribute describing the slot the
 * image occupies — without one the browser assumes 100vw and over-fetches.
 */
export function srcSet(src: string): string {
	return `${webUrl(src)} ${IMAGE_WIDTHS.web}w, ${fullUrl(src)} ${IMAGE_WIDTHS.full}w`;
}
