/**
 * Map a stored artwork image filename to its generated WebP derivatives.
 *
 * Originals live in `static/images/<file>`. The Python helper
 * `scripts/generate_image_derivatives.py` writes downscaled WebP copies into
 * `static/images/web/` (main gallery view + lightbox) and
 * `static/images/thumb/` (thumbnail strips), keeping the original's stem and
 * swapping the extension for `.webp`. These helpers build the matching URLs.
 *
 * Because the mapping strips the extension, a data/disk mismatch such as
 * `"photo.jpg"` vs `photo.jpeg` resolves to the same `photo.webp` either way.
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

/** URL for the untouched original — used as a runtime fallback. */
export function originalUrl(src: string): string {
	return `/images/${src}`;
}

/**
 * `<img onerror>` helper. If a WebP derivative fails to load (e.g. the script
 * hasn't been run for a newly added image), swap the element to the original
 * file once. Returns `false` once the element is already showing the original,
 * so the caller can decide what to hide. The original URL is read from the
 * `data-fallback` attribute, and the swap self-resets when the bound `src`
 * later changes (e.g. navigating the gallery), so no manual flag is needed.
 */
export function swapToOriginal(img: HTMLImageElement): boolean {
	const fallback = img.dataset.fallback;
	if (!fallback || img.getAttribute('src') === fallback) return false;
	img.setAttribute('src', fallback);
	return true;
}
