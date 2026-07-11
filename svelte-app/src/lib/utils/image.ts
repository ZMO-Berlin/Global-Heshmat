/**
 * Map a stored artwork image filename to its generated WebP derivatives.
 *
 * Originals are archived in `originals/` (outside `static/`, so they never
 * ship in the deployed site). The Python helper
 * `scripts/generate_image_derivatives.py` writes downscaled WebP copies into
 * `static/images/web/` (main gallery view + lightbox) and
 * `static/images/thumb/` (thumbnail strips), keeping the original's stem and
 * swapping the extension for `.webp`. These helpers build the matching URLs.
 *
 * Because the mapping strips the extension, a data/disk mismatch such as
 * `"photo.jpg"` vs `photo.jpeg` resolves to the same `photo.webp` either way.
 * The data-integrity test (`src/lib/data/data-integrity.test.ts`) and
 * `npm run verify:build` both fail when a referenced image has no derivative,
 * so the app can rely on these URLs resolving.
 */

/** Strip the file extension from a stored image filename. */
function stem(file: string): string {
	return file.replace(/\.[^./\\]+$/, '');
}

/** URL for the small WebP thumbnail (gallery / lightbox thumb strips). */
export function thumbUrl(src: string): string {
	return `/images/thumb/${stem(src)}.webp`;
}

/** URL for the web-size WebP derivative (main gallery view + lightbox). */
export function webUrl(src: string): string {
	return `/images/web/${stem(src)}.webp`;
}
