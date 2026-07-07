/**
 * Map a stored artwork video filename to its served URL.
 *
 * Unlike images (which have generated WebP derivatives — see image.ts), local
 * videos are served as-is from `static/videos/<file>`. Keeping this in a helper
 * mirrors the image-URL helpers and gives us one place to change if a
 * transcoding/derivative pipeline is ever added for video.
 */

/** URL for a local video stored in static/videos/. */
export function videoUrl(src: string): string {
	return `/videos/${src}`;
}
