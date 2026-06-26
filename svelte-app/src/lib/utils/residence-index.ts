import type { Residence } from '$lib/data/types';
import { slugify } from './slug';

/**
 * Take a raw list of places of residence (typically loaded by Vite's
 * import.meta.glob) and return them sorted by id with a guaranteed `slug` on
 * every entry — either the explicit `slug` field on the source file, or one
 * derived from `name`. Throws if two residences would resolve to the same
 * slug, so URL collisions are caught at build time, not in production.
 *
 * Mirrors buildArtworkIndex; the two slug namespaces are independent because
 * they live under different route prefixes (/artworks/… vs /residences/…).
 */
export function buildResidenceIndex(raw: Residence[]): Residence[] {
	const indexed = raw
		.map((r) => ({ ...r, slug: r.slug ?? slugify(r.name) }))
		.sort((a, b) => a.id - b.id);

	const seen = new Map<string, number>();
	for (const r of indexed) {
		const existing = seen.get(r.slug!);
		if (existing !== undefined) {
			throw new Error(
				`Duplicate residence slug "${r.slug}" — used by id ${existing} and id ${r.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seen.set(r.slug!, r.id);
	}

	return indexed;
}
