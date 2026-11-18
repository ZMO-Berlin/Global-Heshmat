import { expect, it } from 'vitest';
import { MAX_FIELDBOOK_KEYS, parseFieldbookKeys } from './fieldbook-keys';

it('keeps valid artwork and residence keys in order', () =>
	expect(parseFieldbookKeys(['artwork:3', 'residence:12', 'artwork:1'])).toEqual([
		'artwork:3',
		'residence:12',
		'artwork:1'
	]));
it('drops malformed keys and non-strings', () =>
	expect(
		parseFieldbookKeys([
			'artwork:3',
			'person:1',
			'artwork:',
			'artwork:1a',
			' artwork:2',
			'artwork:2\n',
			'Artwork:4',
			'residence:-1',
			4,
			null,
			{ key: 'artwork:5' },
			['artwork:6']
		])
	).toEqual(['artwork:3']));
it(`caps the result at ${MAX_FIELDBOOK_KEYS} keys`, () => {
	const keys = Array.from({ length: MAX_FIELDBOOK_KEYS + 5 }, (_, i) => `artwork:${i}`);
	const parsed = parseFieldbookKeys(keys)!;
	expect(parsed).toHaveLength(MAX_FIELDBOOK_KEYS);
	expect(parsed.at(-1)).toBe(`artwork:${MAX_FIELDBOOK_KEYS - 1}`);
});
it('applies the cap after filtering', () => {
	const keys = ['bad', ...Array.from({ length: MAX_FIELDBOOK_KEYS }, (_, i) => `residence:${i}`)];
	expect(parseFieldbookKeys(keys)).toHaveLength(MAX_FIELDBOOK_KEYS);
});
it('returns null for anything but an array', () => {
	for (const value of [null, undefined, 'artwork:1', 1, { 0: 'artwork:1' }])
		expect(parseFieldbookKeys(value)).toBeNull();
	expect(parseFieldbookKeys([])).toEqual([]);
});
