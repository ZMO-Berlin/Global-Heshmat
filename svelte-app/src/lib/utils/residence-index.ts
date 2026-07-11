import type { IndexedResidence, Residence } from '$lib/data/types';
import { slugify } from './slug';

/**
 * Take a raw list of places of residence (typically loaded by Vite's
 * import.meta.glob) and return them sorted by id with a guaranteed `slug` on
 * every entry — either the explicit `slug` field on the source file, or one
 * derived from `name`. Throws on duplicate slugs, duplicate ids, or an empty
 * slug, so URL and identity collisions are caught at build time, not in
 * production.
 *
 * Mirrors buildArtworkIndex; the two slug namespaces are independent because
 * they live under different route prefixes (/artworks/… vs /residences/…).
 */
export function buildResidenceIndex(raw: Residence[]): IndexedResidence[] {
	const indexed: IndexedResidence[] = raw
		.map((r) => ({ ...r, slug: r.slug ?? slugify(r.name) }))
		.sort((a, b) => a.id - b.id);

	const seenSlugs = new Map<string, number>();
	const seenIds = new Map<number, string>();
	for (const r of indexed) {
		if (!r.slug) {
			throw new Error(
				`Residence id ${r.id} ("${r.name}") resolves to an empty slug. Set an explicit \`slug\` on it.`
			);
		}
		const slugOwner = seenSlugs.get(r.slug);
		if (slugOwner !== undefined) {
			throw new Error(
				`Duplicate residence slug "${r.slug}" — used by id ${slugOwner} and id ${r.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seenSlugs.set(r.slug, r.id);

		const idOwner = seenIds.get(r.id);
		if (idOwner !== undefined) {
			throw new Error(
				`Duplicate residence id ${r.id} — used by "${idOwner}" and "${r.name}". Give one of them the next free id (this happens when a copied file keeps the template's id).`
			);
		}
		seenIds.set(r.id, r.name);
	}

	return indexed;
}
