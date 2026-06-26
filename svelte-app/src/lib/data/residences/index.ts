/**
 * Auto-imports every place-of-residence file in this folder (mirrors
 * artworks/index.ts). To add one, drop in a new .ts file copied from
 * _template.ts — no registration needed.
 *
 * The slug-derivation and collision check live in
 * `$lib/utils/residence-index.ts` so they can be unit-tested independently of
 * the live filesystem.
 */

import type { Residence } from '../types';
import { buildResidenceIndex } from '$lib/utils/residence-index';

const modules = import.meta.glob<{ default: Residence }>('./*.ts', { eager: true });

const raw: Residence[] = Object.entries(modules)
	.filter(([path]) => !path.includes('_template') && !path.includes('index'))
	.map(([, mod]) => mod.default);

export default buildResidenceIndex(raw);
