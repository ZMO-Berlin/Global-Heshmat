import { describe, expect, it } from 'vitest';
import { countLabel, plainText } from './text';

describe('countLabel', () => {
	it('uses the singular only for exactly one', () => {
		expect(countLabel(1, 'photo')).toBe('1 photo');
		expect(countLabel(0, 'photo')).toBe('0 photos');
		expect(countLabel(17, 'photo')).toBe('17 photos');
	});

	it('accepts an irregular plural', () => {
		expect(countLabel(1, 'entry', 'entries')).toBe('1 entry');
		expect(countLabel(43, 'entry', 'entries')).toBe('43 entries');
	});
});

describe('plainText', () => {
	it('keeps word breaks where tags stood and collapses whitespace', () => {
		expect(plainText('Hasselt<br>Belgium')).toBe('Hasselt Belgium');
		expect(plainText(' <em>Dawn</em>  of <a href="x">Egypt</a> ')).toBe('Dawn of Egypt');
	});
});
