import type { Indexed } from '$lib/utils/build-index';
import type { PeopleGroupId } from './people/_groups';

export interface ArtworkLink {
	label: string;
	url: string;
}

export interface ArtworkImage {
	id?: string;
	src: string;
	caption?: string;
	alt?: string;
	credit?: string;
	date?: string;
	rights?: string;
	rightsHolder?: string;
	sourceUrl?: string;
	documentType?: 'photograph' | 'archival-document' | 'drawing';
}

export interface SourceReference {
	label: string;
	url?: string;
	checkedOn?: string;
}
export interface DocumentaryEvent {
	id: string;
	type: 'commission' | 'installation' | 'relocation' | 'exhibition' | 'residence' | 'observation';
	title: string;
	date: string;
	endDate?: string;
	qualifier?: 'exact' | 'approximate' | 'before' | 'after';
	description?: string;
	sources: SourceReference[];
}
export interface DocumentaryMetadata {
	updatedOn?: string;
	events?: DocumentaryEvent[];
	displayTitle?: string;
	siteName?: string;
	district?: string;
	aliases?: string[];
	coverImage?: string;
	entryKind?: 'work' | 'ensemble' | 'institution' | 'residence';
	locationPrecision?: 'exact' | 'approximate' | 'city' | 'last-known';
	sources?: SourceReference[];
	creationPlace?: { name: string; lat?: number; lng?: number };
}

export interface ArtworkMovement {
	fromLat: number;
	fromLng: number;
	fromName: string;
	year: number;
}

export interface Artwork extends DocumentaryMetadata {
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
export type IndexedArtwork = Indexed<Artwork, 'artwork'>;

/**
 * A place where Hassan Heshmat lived or worked (his hometown on the Nile,
 * Cairo, Selb, …), as distinct from where his artworks stand. Surfaced under
 * the "Places of residence" map category and drawn as a diamond marker.
 */
export interface Residence extends DocumentaryMetadata {
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
export type IndexedResidence = Indexed<Residence, 'residence'>;

/** A collection record reference, as produced by `entryKey()`: "artwork:3", "residence:3". */
export type EntryKey = `${'artwork' | 'residence'}:${number}`;

/** One source group of the People profiles (see `people/_groups.ts`). */
export interface PeopleGroup {
	id: string;
	name: string;
	/** Zero-based paragraph index of the group heading in the source document. */
	sourceParagraph: number;
}

/** A source passage about several people at once (see `people/_contexts.ts`). */
export interface PeopleContext {
	id: string;
	/** Slugs of every profile the passage is shown on. */
	people: string[];
	sourceParagraphs: number[];
	paragraphs: string[];
}

/**
 * One People profile, as written in its data file `people/<slug>.ts` (see
 * `people/_template.ts`). Profiles are document-based: `paragraphs` and
 * `notes` are the source wording, never a generated summary.
 */
export interface PersonRecord {
	/** Permanent URL slug — /people/<slug>/ — and the data file's name. */
	slug: string;
	name: string;
	groups: PeopleGroupId[];
	/** Places literally mentioned in the passage or its group heading. */
	places: string[];
	/** Zero-based paragraph indices in the source document; profiles are listed in this order. */
	sourceParagraphs: number[];
	paragraphs: string[];
	/** Collection records the passage explicitly mentions. Shown reciprocally on each record. */
	relatedEntries?: EntryKey[];
	/** Slugs of profiles the passage refers to ("see above"). */
	seeAlso?: string[];
	/** Footnotes from the source document. */
	notes?: string[];
	/** Published works the editors cite beside the source document, without tracking parameters. */
	sources?: SourceReference[];
}

/** A profile after indexing: every optional list is present (possibly empty). */
export type Person = Required<PersonRecord> & { kind: 'person' };
