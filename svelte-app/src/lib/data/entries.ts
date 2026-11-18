import { artworks } from './artworks';
import { residences } from './residences';
import { entryKey, type Entry } from '#lib/utils/collection.js';

/** Every collection record: artworks, then places of residence, each in id order. */
export const entries: Entry[] = [...artworks, ...residences];

const byKey = new Map<string, Entry>(entries.map((item) => [entryKey(item), item]));

/** Look up a record by its `kind:id` key. Returns undefined for an unknown key. */
export function entryByKey(key: string): Entry | undefined {
	return byKey.get(key);
}
