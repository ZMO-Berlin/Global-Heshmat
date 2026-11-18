import { describe, expect, it } from 'vitest';
import { artworkInfoSubject, mailtoHref } from './mailto';

describe('artworkInfoSubject', () => {
	it('names the artwork and its stable id', () => {
		expect(artworkInfoSubject({ name: 'Panorama October', id: 16 })).toBe(
			'Global Heshmat — information about Panorama October (artwork 16)'
		);
	});
});

describe('mailtoHref', () => {
	it('encodes the subject and leaves out an absent body', () => {
		expect(mailtoHref('a@example.org', 'A & B — ?')).toBe(
			'mailto:a@example.org?subject=A%20%26%20B%20%E2%80%94%20%3F'
		);
	});

	it('encodes line breaks in the body', () => {
		expect(mailtoHref('a@example.org', 'S', 'Line 1\nLine 2')).toBe(
			'mailto:a@example.org?subject=S&body=Line%201%0ALine%202'
		);
	});
});
