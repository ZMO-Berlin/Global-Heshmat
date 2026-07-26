/**
 * Auto-imports every place-of-residence file in this folder (mirrors
 * artworks/index.ts). To add one, drop in a new .ts file copied from
 * _template.ts — no registration needed.
 *
 * The slug-derivation and collision check live in
 * `$lib/utils/build-index.ts` (shared with the artworks collection) so they
 * can be unit-tested independently of the live filesystem.
 */

import type { Residence } from '../types';
import { buildIndex } from '$lib/utils/build-index';

// Negative patterns exclude the template and this index at glob time —
// unlike a substring filter, a future data file that happens to contain
// "index" or "template" in its name still gets picked up.
const modules = import.meta.glob<{ default: Residence }>(
	['./*.ts', '!./_template.ts', '!./index.ts'],
	{ eager: true }
);

const raw: Residence[] = Object.values(modules).map((mod) => mod.default);

export default buildIndex(raw, 'residence');
