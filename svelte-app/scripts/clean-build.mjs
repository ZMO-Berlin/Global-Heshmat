import { rm } from 'node:fs/promises';
// Repeated local builds must not accumulate obsolete hashed chunks in the PWA precache.
for (const directory of ['.svelte-kit/output', 'build'])
	await rm(new URL(`../${directory}`, import.meta.url), { recursive: true, force: true });
