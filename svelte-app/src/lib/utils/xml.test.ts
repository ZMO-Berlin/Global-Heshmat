import { describe, expect, it } from 'vitest';
import { escapeXml } from './xml';

describe('escapeXml', () => {
	it('escapes the five XML predefined entities', () => {
		expect(escapeXml(`<a href="x">it's & "fine"</a>`)).toBe(
			'&lt;a href=&quot;x&quot;&gt;it&apos;s &amp; &quot;fine&quot;&lt;/a&gt;'
		);
	});

	it('escapes ampersands first so already-escaped entities are not double-encoded once', () => {
		// The function is intentionally a one-pass replace: callers must pass raw
		// strings, not pre-escaped ones. Documenting the contract via a test.
		expect(escapeXml('&amp;')).toBe('&amp;amp;');
	});

	it('returns the input unchanged when no special characters are present', () => {
		expect(escapeXml('https://heshmat.zmo.de/artworks/foo/')).toBe(
			'https://heshmat.zmo.de/artworks/foo/'
		);
	});

	it('handles the empty string', () => {
		expect(escapeXml('')).toBe('');
	});
});
