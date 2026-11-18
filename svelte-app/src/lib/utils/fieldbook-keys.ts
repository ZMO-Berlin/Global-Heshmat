/** Most selections restored from storage; guards against an oversized or tampered value. */
export const MAX_FIELDBOOK_KEYS = 1000;
const ENTRY_KEY = /^(artwork|residence):\d+$/;

/**
 * Validates a parsed fieldbook value from localStorage: only `artwork:N` and
 * `residence:N` keys survive, capped at MAX_FIELDBOOK_KEYS. Returns null for
 * anything that is not an array, so the caller can keep its current keys.
 */
export function parseFieldbookKeys(stored: unknown): string[] | null {
	if (!Array.isArray(stored)) return null;
	return stored
		.filter((key): key is string => typeof key === 'string' && ENTRY_KEY.test(key))
		.slice(0, MAX_FIELDBOOK_KEYS);
}
