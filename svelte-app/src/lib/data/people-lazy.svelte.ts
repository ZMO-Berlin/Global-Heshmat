/**
 * The People profiles, loaded on first use by the layout-level search and
 * collection results, so the map, gallery and dossier pages don't ship every
 * profile to every visitor. The People routes import `$lib/data/people`
 * statically; there the dynamic import resolves from the module cache.
 *
 * `load()` is only called from effects and event handlers, so the module
 * state is never written during prerendering.
 */
import type { Person } from './types';

let loaded = $state.raw<Person[] | null>(null);
let pending: Promise<void> | undefined;

export const lazyPeople = {
	/** The profiles, or null until the first `load()` resolves. */
	get current(): Person[] | null {
		return loaded;
	},
	load(): void {
		pending ??= import('./people').then(
			(module) => {
				loaded = module.people;
			},
			// Allow a retry, e.g. after a chunk request failed offline.
			() => {
				pending = undefined;
			}
		);
	}
};
