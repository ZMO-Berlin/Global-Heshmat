/**
 * Auto-imports all artwork files in this directory.
 * To add a new artwork: create a new .ts file (copy _template.ts), that's it.
 *
 * Uses Vite's import.meta.glob to eagerly load all .ts files in this folder,
 * excluding the template and this index file.
 *
 * After loading, every artwork is given a guaranteed `slug` — either the
 * explicit `slug` field on the data file, or one derived from `name`. A
 * collision check throws at build time so two artworks can never share a URL.
 */

import type { Artwork } from '../types';
import { slugify } from '../../utils/slug';

const modules = import.meta.glob<{ default: Artwork }>('./*.ts', { eager: true });

const allArtworks: Artwork[] = Object.entries(modules)
	.filter(([path]) => !path.includes('_template') && !path.includes('index'))
	.map(([, mod]) => mod.default)
	.map((a) => ({ ...a, slug: a.slug ?? slugify(a.name) }))
	.sort((a, b) => a.id - b.id);

const seen = new Map<string, number>();
for (const a of allArtworks) {
	const existing = seen.get(a.slug!);
	if (existing !== undefined) {
		throw new Error(
			`Duplicate artwork slug "${a.slug}" — used by id ${existing} and id ${a.id}. Set an explicit \`slug\` on one of them.`
		);
	}
	seen.set(a.slug!, a.id);
}

export default allArtworks;
