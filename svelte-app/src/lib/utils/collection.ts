import { imageStem } from '$lib/media/variants.js';
import type { IndexedArtwork, IndexedResidence, ArtworkImage } from '$lib/data/types';

export type Entry = IndexedArtwork | IndexedResidence;
export type Selection =
	{ kind: 'artwork'; item: IndexedArtwork } | { kind: 'residence'; item: IndexedResidence };
export function entryKind(item: Entry): Selection['kind'] {
	return 'status' in item ? 'artwork' : 'residence';
}
export function entryKey(item: Entry): string {
	return `${entryKind(item)}:${item.id}`;
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
