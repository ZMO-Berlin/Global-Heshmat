import type { Artwork, IndexedArtwork } from '$lib/data/types';
import { slugify } from './slug';

/**
 * Take a raw list of artworks (typically loaded by Vite's import.meta.glob)
 * and return them sorted by id with a guaranteed `slug` on every entry —
 * either the explicit `slug` field on the source file, or one derived from
 * `name`. Throws on duplicate slugs, duplicate ids, or a slug that resolves
 * to the empty string (e.g. a name with no ASCII alphanumerics), so URL and
 * identity collisions are caught at build time, not in production.
 */
export function buildArtworkIndex(raw: Artwork[]): IndexedArtwork[] {
	const indexed: IndexedArtwork[] = raw
		.map((a) => ({ ...a, slug: a.slug ?? slugify(a.name) }))
		.sort((a, b) => a.id - b.id);

	const seenSlugs = new Map<string, number>();
	const seenIds = new Map<number, string>();
	for (const a of indexed) {
		if (!a.slug) {
			throw new Error(
				`Artwork id ${a.id} ("${a.name}") resolves to an empty slug. Set an explicit \`slug\` on it.`
			);
		}
		const slugOwner = seenSlugs.get(a.slug);
		if (slugOwner !== undefined) {
			throw new Error(
				`Duplicate artwork slug "${a.slug}" — used by id ${slugOwner} and id ${a.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seenSlugs.set(a.slug, a.id);

		const idOwner = seenIds.get(a.id);
		if (idOwner !== undefined) {
			throw new Error(
				`Duplicate artwork id ${a.id} — used by "${idOwner}" and "${a.name}". Give one of them the next free id (this happens when a copied file keeps the template's id).`
			);
		}
		seenIds.set(a.id, a.name);
	}

	return indexed;
}
