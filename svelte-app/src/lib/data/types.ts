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
