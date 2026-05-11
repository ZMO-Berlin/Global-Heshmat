/**
 * Auto-imports all artwork files in this directory.
 * To add a new artwork: create a new .ts file (copy _template.ts), that's it.
 *
 * Uses Vite's import.meta.glob to eagerly load all .ts files in this folder,
 * excluding the template and this index file. The slug-derivation and
 * collision check live in `$lib/utils/artwork-index.ts` so they can be
 * unit-tested independently of the live filesystem.
 */

import type { Artwork } from '../types';
import { buildArtworkIndex } from '$lib/utils/artwork-index';

const modules = import.meta.glob<{ default: Artwork }>('./*.ts', { eager: true });

const raw: Artwork[] = Object.entries(modules)
	.filter(([path]) => !path.includes('_template') && !path.includes('index'))
	.map(([, mod]) => mod.default);

export default buildArtworkIndex(raw);
