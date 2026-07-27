import type { Indexed } from '$lib/utils/build-index';

export interface ArtworkLink {
	label: string;
	url: string;
}

export interface ArtworkImage {
	src: string;
	caption?: string;
}

export interface ArtworkMovement {
	fromLat: number;
	fromLng: number;
	fromName: string;
	year: number;
}

export interface Artwork {
	id: number;
	name: string;
	lat: number;
	lng: number;
	country: string;
	city: string;
	status: 'located' | 'search';
	address: string;
	desc: string;
	// Optional URL slug override. If absent, the slug is derived from `name`
	// at load time. Set this explicitly to keep a stable URL when renaming
	// an artwork, or to disambiguate two works that share a name.
	slug?: string;
	image?: string;
	imageCaption?: string;
	images?: ArtworkImage[];
	links?: ArtworkLink[];
	/** A YouTube URL — embedded as an iframe. For a self-hosted clip use `videoFile`. */
	video?: string;
	/**
	 * Filename of a self-hosted clip in `static/videos/` (e.g. "Midan_Galaa.mp4"),
	 * played inline via a native <video> element. Use this for local files; use
	 * `video` for YouTube. The two are independent and may both be set.
	 */
	videoFile?: string;
	/** Optional credit / caption shown beneath the local video. */
	videoCaption?: string;
	movement?: ArtworkMovement;
}

/**
 * An artwork after indexing (see `$lib/utils/build-index.ts`): the slug is
 * resolved and guaranteed, so consumers can build URLs without assertions.
 */
export type IndexedArtwork = Indexed<Artwork>;

/**
 * A place where Hassan Heshmat lived or worked (his hometown on the Nile,
 * Cairo, Selb, …), as distinct from where his artworks stand. Surfaced under
 * the "Places of residence" map category and plotted as its own marker layer.
 */
export interface Residence {
	id: number;
	name: string;
	lat: number;
	lng: number;
	country: string;
	city: string;
	/** Period of residence, e.g. "1957–1959" or "from 1948". */
	years: string;
	/** Short note; HTML is allowed, matching the artwork `desc` convention. */
	desc: string;
	// Optional URL slug override. If absent, the slug is derived from `name` at
	// load time. Mirrors the artwork convention — set it explicitly to keep a
	// stable URL when renaming, or to disambiguate two places that share a name.
	slug?: string;
	/** Optional single photo filename in originals/ (same pipeline as artworks). */
	image?: string;
	imageCaption?: string;
	/**
	 * Optional multiple photos — preferred over `image` when present. Renders
	 * the same thumbnail-strip gallery + lightbox the artworks use.
	 */
	images?: ArtworkImage[];
}

/** A residence after indexing — slug resolved and guaranteed. */
export type IndexedResidence = Indexed<Residence>;
