import { slugify } from './slug';

/**
 * The minimum shape a collection entry needs to be indexable: a numeric
 * identity, a human name to derive a slug from, and an optional explicit
 * slug override. Both `Artwork` and `Residence` satisfy this.
 */
export interface Indexable {
	id: number;
	name: string;
	slug?: string;
}

/** An indexed entry: same fields, with the slug resolved and guaranteed. */
export type Indexed<T extends Indexable> = T & { slug: string };

/**
 * Take a raw collection (typically loaded by Vite's import.meta.glob) and
 * return it sorted by id with a guaranteed `slug` on every entry — either the
 * explicit `slug` field on the source file, or one derived from `name`.
 *
 * Throws on duplicate slugs, duplicate ids, or a slug that resolves to the
 * empty string (e.g. a name with no ASCII alphanumerics), so URL and identity
 * collisions are caught at build time rather than in production.
 *
 * `noun` names the collection in those error messages ("artwork",
 * "residence"). Artworks and residences share this builder but keep separate
 * slug namespaces, because they live under different route prefixes
 * (/artworks/… vs /residences/…).
 */
export function buildIndex<T extends Indexable>(raw: T[], noun: string): Indexed<T>[] {
	const indexed = raw
		.map((item) => ({ ...item, slug: item.slug ?? slugify(item.name) }))
		.sort((a, b) => a.id - b.id);

	const seenSlugs = new Map<string, number>();
	const seenIds = new Map<number, string>();
	for (const item of indexed) {
		if (!item.slug) {
			throw new Error(
				`${cap(noun)} id ${item.id} ("${item.name}") resolves to an empty slug. Set an explicit \`slug\` on it.`
			);
		}
		const slugOwner = seenSlugs.get(item.slug);
		if (slugOwner !== undefined) {
			throw new Error(
				`Duplicate ${noun} slug "${item.slug}" — used by id ${slugOwner} and id ${item.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seenSlugs.set(item.slug, item.id);

		const idOwner = seenIds.get(item.id);
		if (idOwner !== undefined) {
			throw new Error(
				`Duplicate ${noun} id ${item.id} — used by "${idOwner}" and "${item.name}". Give one of them the next free id (this happens when a copied file keeps the template's id).`
			);
		}
		seenIds.set(item.id, item.name);
	}

	return indexed;
}

function cap(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
