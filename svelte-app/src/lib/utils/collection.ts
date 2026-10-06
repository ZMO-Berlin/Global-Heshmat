import { imageStem } from '$lib/media/variants.js';
import type { IndexedArtwork, IndexedResidence, ArtworkImage, EntryKey } from '$lib/data/types';
import type { MarkerKind } from './marker-icons';

/** A collection record. Switch on `kind`; never infer it from optional fields. */
export type Entry = IndexedArtwork | IndexedResidence;
export type Selection =
	{ kind: 'artwork'; item: IndexedArtwork } | { kind: 'residence'; item: IndexedResidence };
export function entryKey(item: Entry): EntryKey {
	return `${item.kind}:${item.id}`;
}

const SEGMENTS = { artwork: 'artworks', residence: 'residences' } as const;
/** Site-relative canonical path of a record page: /artworks/<slug>/ or /residences/<slug>/. */
export function entryPath(item: Pick<Entry, 'kind' | 'slug'>): string {
	return `/${SEGMENTS[item.kind]}/${item.slug}/`;
}

/** The status a record shows and exports — also the marker it is drawn with. */
export type EntryStatus = Extract<MarkerKind, 'located' | 'search' | 'residence'>;
export function entryStatus(item: Entry): EntryStatus {
	return item.kind === 'artwork' ? item.status : 'residence';
}
export const STATUS_LABELS: Record<EntryStatus, string> = {
	located: 'Located',
	search: 'To be found',
	residence: 'Place of residence'
};
/** An artwork whose current location is unconfirmed. */
export function isToBeFound(item: Entry): item is IndexedArtwork & { status: 'search' } {
	return item.kind === 'artwork' && item.status === 'search';
}
export function entryTitle(item: Entry): string {
	return item.displayTitle || item.name;
}
export function entryImages(
	item: Pick<Entry, 'images' | 'image' | 'imageCaption'>
): ArtworkImage[] {
	return item.images?.length
		? item.images
		: item.image
			? [{ src: item.image, caption: item.imageCaption }]
			: [];
}
/** Stable across reordering; an explicit id also survives a filename change. */
export function mediaId(image: ArtworkImage): string {
	return image.id ?? legacyMediaId(image);
}
/** Keep filename-based shared links working after editors add durable IDs. */
export function legacyMediaId(image: ArtworkImage): string {
	return imageStem(image.src);
}
export function matchesMediaId(image: ArtworkImage, id: string | null): boolean {
	return id !== null && (mediaId(image) === id || legacyMediaId(image) === id);
}
export function coverImage(
	item: Pick<Entry, 'images' | 'image' | 'imageCaption' | 'coverImage'>
): ArtworkImage | undefined {
	const images = entryImages(item);
	return (
		images.find(
			(image) => image.src === item.coverImage || matchesMediaId(image, item.coverImage ?? null)
		) ?? images[0]
	);
}
export function imageAlt(image: ArtworkImage, name: string): string {
	return image.alt || image.caption || name;
}
