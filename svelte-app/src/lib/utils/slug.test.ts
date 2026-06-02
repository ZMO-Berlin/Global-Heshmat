import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
	it('lowercases and joins words with single hyphens', () => {
		expect(slugify('Sphinx Avenue Relief')).toBe('sphinx-avenue-relief');
	});

	it('strips punctuation and collapses runs of non-alphanumerics', () => {
		// `№` NFKD-decomposes to "No" via Unicode compatibility decomposition,
		// so it survives the ASCII filter as letters rather than being dropped.
		expect(slugify("Café d'Aïcha — №2!")).toBe('cafe-d-aicha-no2');
	});

	it('removes diacritics for ASCII-only output', () => {
		expect(slugify('Frédérick Madore')).toBe('frederick-madore');
	});

	it('trims leading and trailing hyphens', () => {
		expect(slugify('--hello world--')).toBe('hello-world');
	});

	it('returns empty string when there are no alphanumerics', () => {
		expect(slugify('!!! ??? ...')).toBe('');
	});

	it('preserves digits', () => {
		expect(slugify('10th of Ramadan City')).toBe('10th-of-ramadan-city');
	});

	it('handles already-slugified input as a fixed point', () => {
		expect(slugify('the-nile-fisherman')).toBe('the-nile-fisherman');
	});
});
