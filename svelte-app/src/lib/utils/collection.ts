import type { Artwork, Residence, ArtworkImage } from '$lib/data/types';

export type Entry = Artwork | Residence;
export type Selection = { kind: 'artwork'; item: Artwork } | { kind: 'residence'; item: Residence };
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
	return image.id ?? image.src.normalize('NFC').replace(/\.[^./\\]+$/, '');
}
export function coverImage(item: Entry): ArtworkImage | undefined {
	const images = entryImages(item);
	return (
		images.find((image) => image.src === item.coverImage || mediaId(image) === item.coverImage) ??
		images[0]
	);
}
export function imageAlt(image: ArtworkImage, name: string): string {
	return image.alt || image.caption || name;
}
