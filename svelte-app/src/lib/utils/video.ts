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

/**
 * Extract the 11-character video id from a YouTube URL, for building an
 * /embed/ iframe src. Returns null when the URL carries no id — a playlist
 * link, say — so the caller can skip rendering the embed rather than pointing
 * an iframe at a malformed URL.
 *
 * Recognised forms: watch?v=, youtu.be/, /embed/, /shorts/, /live/, and any of
 * those with extra query parameters.
 */
export function youTubeId(url: string): string | null {
	const patterns = [
		/[?&]v=([\w-]{11})(?![\w-])/,
		/youtu\.be\/([\w-]{11})(?![\w-])/,
		/\/(?:embed|shorts|live|v)\/([\w-]{11})(?![\w-])/
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}
