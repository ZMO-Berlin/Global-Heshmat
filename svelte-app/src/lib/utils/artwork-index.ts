import type { Artwork } from '$lib/data/types';
import { slugify } from './slug';

/**
 * Take a raw list of artworks (typically loaded by Vite's import.meta.glob)
 * and return them sorted by id with a guaranteed `slug` on every entry —
 * either the explicit `slug` field on the source file, or one derived from
 * `name`. Throws if two artworks would resolve to the same slug, so URL
 * collisions are caught at build time, not in production.
 */
export function buildArtworkIndex(raw: Artwork[]): Artwork[] {
	const indexed = raw
		.map((a) => ({ ...a, slug: a.slug ?? slugify(a.name) }))
		.sort((a, b) => a.id - b.id);

	const seen = new Map<string, number>();
	for (const a of indexed) {
		const existing = seen.get(a.slug!);
		if (existing !== undefined) {
			throw new Error(
				`Duplicate artwork slug "${a.slug}" — used by id ${existing} and id ${a.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seen.set(a.slug!, a.id);
	}

	return indexed;
}
