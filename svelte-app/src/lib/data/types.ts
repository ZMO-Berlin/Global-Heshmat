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
	video?: string;
	movement?: ArtworkMovement;
}

/**
 * A place where Hassan Heshmat lived or worked (his hometown on the Nile,
 * Cairo, Selb, …), as distinct from where his artworks stand. Surfaced under
 * the "Places of residence" map category.
 *
 * NOTE: residence markers are not plotted on the map yet — the category is a
 * legend/filter placeholder. These files are collected and ready to render.
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
	/** Optional photo filename in static/images/ (same pipeline as artworks). */
	image?: string;
	imageCaption?: string;
}
