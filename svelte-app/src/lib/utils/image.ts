import { imageStem } from '$lib/media/variants.js';
import manifest from '$lib/data/image-manifest.json';
import { coverImage } from './collection';
type Variant = 'thumb' | 'preview' | 'web' | 'full';
type Dimensions = { width: number; height: number; bytes: number };
const images: Record<string, Record<Variant, Dimensions>> = manifest;
const stem = imageStem;
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
// Cards and Photos-mode tiles stop at the 800px preview: their slots are at
// most ~350 CSS px, so a 3x phone would otherwise fetch 1200px web files for
// every cover (about 2.4x the bytes) for no visible gain.
export const cardSrcSet = (src: string) => candidates(src, ['thumb', 'preview']);
export function leadImage(item: Parameters<typeof coverImage>[0]): string | undefined {
	return coverImage(item)?.src;
}
