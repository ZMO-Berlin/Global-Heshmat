import { describe, expect, it } from 'vitest';
import { EXCERPT_CONTEXT, EXCERPT_FROM, excerptRanges, segments } from './passage';

describe('segments', () => {
	it('splits a range into marked and unmarked runs', () => {
		const text = 'قابلت ثروت عكاشة فى روما';
		const start = text.indexOf('ثروت');
		const marks: [number, number][] = [[start, start + 'ثروت عكاشة'.length]];
		expect(segments(text, marks, [0, text.length])).toEqual([
			{ text: 'قابلت ', mark: false },
			{ text: 'ثروت عكاشة', mark: true },
			{ text: ' فى روما', mark: false }
		]);
	});

	it('clips a mark to the range shown', () => {
		expect(segments('abcdef', [[1, 5]], [3, 6])).toEqual([
			{ text: 'de', mark: true },
			{ text: 'f', mark: false }
		]);
	});
});

describe('excerptRanges', () => {
	const sentence = (word: string, words = 60) => `${word} ${'كلام '.repeat(words).trim()}. `;
	const text = ['أول', 'ثان', 'ثالث', 'رابع'].map((word) => sentence(word)).join('');

	it('keeps a short paragraph whole', () => {
		expect(excerptRanges('نص قصير. وآخر.', [[0, 2]])).toEqual([[0, 14]]);
	});

	it('keeps only the sentences holding a mark in a long paragraph', () => {
		expect(text.length).toBeGreaterThan(EXCERPT_FROM);
		const at = text.indexOf('ثالث');
		const ranges = excerptRanges(text, [[at, at + 4]]);
		expect(ranges).toHaveLength(1);
		expect(text.slice(...ranges[0])).toBe(sentence('ثالث'));
	});

	it('joins neighbouring sentences and keeps the whole paragraph on request', () => {
		const a = text.indexOf('ثان');
		const b = text.indexOf('ثالث');
		const marks: [number, number][] = [
			[a, a + 3],
			[b, b + 4]
		];
		expect(excerptRanges(text, marks).map((r) => text.slice(...r))).toEqual([
			sentence('ثان') + sentence('ثالث')
		]);
		expect(excerptRanges(text, marks, true)).toEqual([[0, text.length]]);
	});

	it('widens a short sentence with the ones that follow', () => {
		const short = ['أول', 'ثان', 'ثالث', 'رابع', 'خامس', 'سادس', 'سابع', 'ثامن']
			.map((word) => sentence(word, 20))
			.join('');
		const at = short.indexOf('ثان');
		const [range, ...rest] = excerptRanges(short, [[at, at + 3]]);
		expect(rest).toEqual([]);
		expect(short.slice(...range).startsWith('ثان')).toBe(true);
		expect(range[1] - range[0]).toBeGreaterThanOrEqual(EXCERPT_CONTEXT);
		expect(range[1]).toBeLessThan(short.length);
	});
});
