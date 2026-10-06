/**
 * Auto-imports every People profile in this folder (mirrors artworks/index.ts).
 * To add a person: copy _template.ts to <slug>.ts and fill it in — no
 * registration needed.
 *
 * Files starting with "_" are not profiles: the template, the source groups
 * (_groups.ts) and the passages shared by several people (_contexts.ts). The
 * filename/slug and cross-reference checks live in `$lib/utils/build-index.ts`
 * so they can be unit-tested independently of the live filesystem.
 */

import type { PersonRecord } from '../types';
import { buildPeopleIndex } from '$lib/utils/build-index';
import { peopleContexts } from './_contexts';

const modules = import.meta.glob<{ default: PersonRecord }>(['./*.ts', '!./_*.ts', '!./index.ts'], {
	eager: true
});

export default buildPeopleIndex(modules, peopleContexts);
