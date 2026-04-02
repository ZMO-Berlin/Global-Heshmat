/**
 * Auto-imports all artwork files in this directory.
 * To add a new artwork: create a new .ts file (copy _template.ts), that's it.
 *
 * Uses Vite's import.meta.glob to eagerly load all .ts files in this folder,
 * excluding the template and this index file.
 */

import type { Artwork } from '../types';

const modules = import.meta.glob<{ default: Artwork }>('./*.ts', { eager: true });

const allArtworks: Artwork[] = Object.entries(modules)
	.filter(([path]) => !path.includes('_template') && !path.includes('index'))
	.map(([, mod]) => mod.default)
	.sort((a, b) => a.id - b.id);

export default allArtworks;
