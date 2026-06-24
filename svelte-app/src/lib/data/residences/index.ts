/**
 * Auto-imports every place-of-residence file in this folder (mirrors
 * artworks/index.ts). To add one, drop in a new .ts file copied from
 * _template.ts — no registration needed.
 *
 * Residences are not plotted on the map yet; this simply makes the data
 * available, sorted by id, for when the "Places of residence" category is
 * switched on in MapView.svelte.
 */

import type { Residence } from '../types';

const modules = import.meta.glob<{ default: Residence }>('./*.ts', { eager: true });

const residences: Residence[] = Object.entries(modules)
	.filter(([path]) => !path.includes('_template') && !path.includes('index'))
	.map(([, mod]) => mod.default)
	.sort((a, b) => a.id - b.id);

export default residences;
