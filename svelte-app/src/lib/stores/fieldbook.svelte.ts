import { SvelteSet } from 'svelte/reactivity';
import { getContext, setContext, onMount } from 'svelte';
import { entryKey, type Entry } from '$lib/utils/collection';
const CONTEXT = Symbol('fieldbook');
const STORAGE_KEY = 'global-heshmat-fieldbook-v1';
export function createFieldbook() {
	let keys = $state<string[]>([]);
	let storageMessage = $state('');
	onMount(() => {
		function restore() {
			try {
				const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
				if (Array.isArray(stored))
					keys = stored
						.filter(
							(key): key is string =>
								typeof key === 'string' && /^(artwork|residence):\d+$/.test(key)
						)
						.slice(0, 1000);
			} catch {
				storageMessage =
					'Selections are available for this visit; this browser could not restore saved selections.';
			}
		}
		restore();
		const changed = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY) restore();
		};
		window.addEventListener('storage', changed);
		return () => window.removeEventListener('storage', changed);
	});
	function persist() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
		} catch {
			storageMessage = 'This browser could not save your selection between visits.';
		}
	}
	const store = {
		get keys() {
			return keys;
		},
		get storageMessage() {
			return storageMessage;
		},
		has(item: Entry) {
			return keys.includes(entryKey(item));
		},
		toggle(item: Entry) {
			const key = entryKey(item);
			keys = keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key];
			persist();
		},
		add(items: Entry[]) {
			keys = [...new SvelteSet([...keys, ...items.map(entryKey)])];
			persist();
		},
		clear() {
			keys = [];
			persist();
		}
	};
	setContext(CONTEXT, store);
	return store;
}
export function getFieldbook(): ReturnType<typeof createFieldbook> {
	return getContext(CONTEXT);
}
