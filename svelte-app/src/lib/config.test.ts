import { describe, expect, it } from 'vitest';
import { SITE_URL, absoluteUrl } from './config';
import { entryPath } from './utils/collection';

describe('SITE_URL', () => {
	it('is the production heshmat.zmo.de origin without a trailing slash', () => {
		expect(SITE_URL).toBe('https://heshmat.zmo.de');
	});
});

describe('absoluteUrl', () => {
	it('prefixes a leading-slash path with the site URL', () => {
		expect(absoluteUrl('/about/')).toBe('https://heshmat.zmo.de/about/');
	});

	it('inserts a missing leading slash', () => {
		expect(absoluteUrl('about/')).toBe('https://heshmat.zmo.de/about/');
	});

	it('returns the bare origin with a trailing slash for the root', () => {
		expect(absoluteUrl('/')).toBe('https://heshmat.zmo.de/');
	});
});

describe('entryPath', () => {
	it('returns a directory-style path with leading and trailing slashes', () => {
		expect(entryPath({ kind: 'artwork', slug: 'the-nile-fisherman' })).toBe(
			'/artworks/the-nile-fisherman/'
		);
		expect(entryPath({ kind: 'residence', slug: 'selb' })).toBe('/residences/selb/');
	});

	it('does not encode the slug — slugs are already URL-safe by construction', () => {
		expect(entryPath({ kind: 'artwork', slug: 'a-b-c-1' })).toBe('/artworks/a-b-c-1/');
	});

	it('composes with absoluteUrl into the canonical artwork URL', () => {
		expect(absoluteUrl(entryPath({ kind: 'artwork', slug: 'foo' }))).toBe(
			'https://heshmat.zmo.de/artworks/foo/'
		);
	});
});
