import manifest from '$lib/data/image-manifest.json';
import { entryImages } from './collection';
type Variant = 'thumb' | 'preview' | 'web' | 'full';
type Dimensions = { width: number; height: number; bytes: number };
const images: Record<string, Record<Variant, Dimensions>> = manifest;
const stem = (src: string) => src.normalize('NFC').replace(/\.[^./\\]+$/, '');
const url = (src: string, variant: Variant) =>
	// Interior commas are valid in srcset URLs. Keep them literal so SvelteKit's
	// decodeURI-based prerender crawler can match the static filename.
	`/images/${variant}/${encodeURIComponent(stem(src)).replace(/%2C/g, ',')}.webp`;
export const thumbUrl = (src: string) => url(src, 'thumb');
export const webUrl = (src: string) => url(src, 'web');
export const fullUrl = (src: string) => url(src, 'full');
export function imageDimensions(src: string, variant: Variant = 'web'): Dimensions {
	const dimensions = images[stem(src)]?.[variant];
	if (!dimensions) throw new Error(`Missing media metadata: ${src} (${variant})`);
	return dimensions;
}
function candidates(src: string, variants: Variant[]): string {
	const widths = new Map<number, string>();
	for (const variant of variants) {
		const { width } = imageDimensions(src, variant);
		if (!widths.has(width)) widths.set(width, url(src, variant));
	}
	return [...widths].map(([width, source]) => `${source} ${width}w`).join(', ');
}
export const srcSet = (src: string) => candidates(src, ['preview', 'web', 'full']);
export const cardSrcSet = (src: string) => candidates(src, ['thumb', 'preview', 'web']);
export function leadImage(item: {
	images?: { src: string }[];
	image?: string;
	coverImage?: string;
}): string | undefined {
	return (
		entryImages(item).find((image) => image.src === item.coverImage)?.src ??
		entryImages(item)[0]?.src
	);
}
