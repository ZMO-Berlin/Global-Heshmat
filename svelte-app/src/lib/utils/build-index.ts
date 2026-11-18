import { slugify } from './slug';
import { typeset } from './typography';
import type { ArtworkImage, PeopleContext, Person, PersonRecord } from '#lib/data/types.js';

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The minimum shape a collection entry needs to be indexable: a numeric
 * identity, a human name to derive a slug from, and an optional explicit
 * slug override. Both `Artwork` and `Residence` satisfy this.
 */
export interface Indexable {
	id: number;
	name: string;
	slug?: string;
	image?: string;
	imageCaption?: string;
	images?: ArtworkImage[];
}

/**
 * An indexed entry: same fields, with the slug resolved and guaranteed, an
 * explicit `kind` — consumers switch on it instead of guessing the entity
 * type from which optional fields happen to be present — and an `images`
 * album that also holds a legacy single `image`.
 */
export type Indexed<T extends Indexable, K extends string> = T & {
	slug: string;
	kind: K;
	images: ArtworkImage[];
};

/** The album of a raw record: its `images`, else the legacy `image` + `imageCaption` pair. */
function album(item: Indexable): ArtworkImage[] {
	if (item.images?.length) return item.images;
	return item.image ? [{ src: item.image, caption: item.imageCaption }] : [];
}

/**
 * Take a raw collection (typically loaded by Vite's import.meta.glob) and
 * return it sorted by id with a guaranteed `slug` on every entry — either the
 * explicit `slug` field on the source file, or one derived from `name`.
 *
 * Throws on duplicate slugs, duplicate ids, or a slug that resolves to the
 * empty string (e.g. a name with no ASCII alphanumerics), so URL and identity
 * collisions are caught at build time rather than in production.
 *
 * Every entry gets an `images` array (possibly empty), so readers never
 * branch on the legacy single-image fields.
 *
 * `kind` is stamped on every entry and names the collection in those error
 * messages ("artwork", "residence"). Artworks and residences share this
 * builder but keep separate slug namespaces, because they live under
 * different route prefixes (/artworks/… vs /residences/…).
 */
export function buildIndex<T extends Indexable, K extends string>(
	raw: T[],
	kind: K
): Indexed<T, K>[] {
	const indexed = raw
		// Prose gets typographic quotes; the slug still comes from the name as typed.
		.map((item) => {
			const typeset_ = typeset(item);
			// `image` and `imageCaption` stay on the entry: the JSON export keeps them.
			return { ...typeset_, slug: item.slug ?? slugify(item.name), kind, images: album(typeset_) };
		})
		.sort((a, b) => a.id - b.id);

	const seenSlugs = new Map<string, number>();
	const seenIds = new Map<number, string>();
	for (const item of indexed) {
		if (!item.slug) {
			throw new Error(
				`${cap(kind)} id ${item.id} ("${item.name}") resolves to an empty slug. Set an explicit \`slug\` on it.`
			);
		}
		if (!Number.isSafeInteger(item.id) || item.id <= 0)
			throw new Error(`${kind} ID must be a positive integer: ${item.id}`);
		if (!SAFE_SLUG.test(item.slug)) throw new Error(`Unsafe ${kind} slug: ${item.slug}`);
		const slugOwner = seenSlugs.get(item.slug);
		if (slugOwner !== undefined) {
			throw new Error(
				`Duplicate ${kind} slug "${item.slug}" — used by id ${slugOwner} and id ${item.id}. Set an explicit \`slug\` on one of them.`
			);
		}
		seenSlugs.set(item.slug, item.id);

		const idOwner = seenIds.get(item.id);
		if (idOwner !== undefined) {
			throw new Error(
				`Duplicate ${kind} id ${item.id} — used by "${idOwner}" and "${item.name}". Give one of them the next free id (this happens when a copied file keeps the template's id).`
			);
		}
		seenIds.set(item.id, item.name);
	}

	return indexed;
}

/**
 * Index the People profiles loaded by import.meta.glob (keyed by file path).
 *
 * A profile has no numeric id: its explicit slug is its identity, and it must
 * match the filename, so `louis-bishara.ts` is always the file behind
 * /people/louis-bishara/ (and two profiles can never share a slug). Profiles
 * come back in source-document order — by first source paragraph — with the
 * optional lists defaulted to [].
 *
 * Throws on a filename/slug mismatch, an unsafe slug, a profile without a
 * passage, or a `seeAlso` / shared passage that names an unknown profile, so
 * a broken cross-reference fails the build instead of rendering a dead link.
 */
export function buildPeopleIndex(
	modules: Record<string, { default: PersonRecord }>,
	contexts: readonly PeopleContext[]
): Person[] {
	const people: Person[] = Object.entries(modules).map(([path, { default: record }]) => {
		const file = path.slice(path.lastIndexOf('/') + 1).replace(/\.ts$/, '');
		if (!SAFE_SLUG.test(record.slug)) throw new Error(`Unsafe person slug: ${record.slug}`);
		if (record.slug !== file)
			throw new Error(
				`People file ${file}.ts declares slug "${record.slug}". Name the file ${record.slug}.ts — published slugs must not change.`
			);
		if (!record.paragraphs.length) throw new Error(`Person ${record.slug} has no paragraphs`);
		return {
			...typeset(record),
			kind: 'person' as const,
			relatedEntries: record.relatedEntries ?? [],
			seeAlso: record.seeAlso ?? [],
			notes: record.notes ?? [],
			sources: record.sources ?? []
		};
	});
	const firstParagraph = (person: Person) => person.sourceParagraphs[0] ?? Infinity;
	people.sort((a, b) => firstParagraph(a) - firstParagraph(b) || a.slug.localeCompare(b.slug));

	const slugs = new Set(people.map((person) => person.slug));
	const requireProfile = (slug: string, from: string) => {
		if (!slugs.has(slug)) throw new Error(`${from} refers to unknown person "${slug}"`);
	};
	for (const person of people)
		for (const slug of person.seeAlso) requireProfile(slug, `Person ${person.slug} seeAlso`);
	for (const context of contexts)
		for (const slug of context.people) requireProfile(slug, `Shared passage ${context.id}`);
	return people;
}

function cap(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
