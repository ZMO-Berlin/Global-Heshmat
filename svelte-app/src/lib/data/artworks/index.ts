/**
 * Auto-imports all artwork files in this directory.
 * To add a new artwork: create a new .ts file (copy _template.ts), that's it.
 *
 * Uses Vite's import.meta.glob to eagerly load all .ts files in this folder,
 * excluding the template and this index file. The slug-derivation and
 * collision check live in `$lib/utils/build-index.ts` (shared with the
 * residences collection) so they can be unit-tested independently of the
 * live filesystem.
 */

import type { Artwork } from '../types';
import { buildIndex } from '$lib/utils/build-index';

// Negative patterns exclude the template and this index at glob time —
// unlike a substring filter, a future data file that happens to contain
// "index" or "template" in its name still gets picked up.
const modules = import.meta.glob<{ default: Artwork }>(
	['./*.ts', '!./_template.ts', '!./index.ts'],
	{ eager: true }
);

const raw: Artwork[] = Object.values(modules).map((mod) => mod.default);

export default buildIndex(raw, 'artwork');
