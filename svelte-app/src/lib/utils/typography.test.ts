import { describe, expect, it } from 'vitest';
import { proseProblems, smartQuotes, typeset, typographyIssues } from './typography';
import { slugify } from './slug';

describe('smartQuotes', () => {
	it('turns a backtick or straight apostrophe inside a word into ’', () => {
		expect(smartQuotes('Musée de l`Homme')).toBe('Musée de l’Homme');
		expect(smartQuotes("Egypt`s first factory and Heshmat's work")).toBe(
			'Egypt’s first factory and Heshmat’s work'
		);
	});

	it('curls quotation marks by position', () => {
		expect(smartQuotes('the statue "Love" and \'Welcome\'')).toBe(
			'the statue “Love” and ‘Welcome’'
		);
		expect(smartQuotes('"Starts here," he wrote.')).toBe('“Starts here,” he wrote.');
		expect(smartQuotes('(“nested ‘quotes’”)')).toBe('(“nested ‘quotes’”)');
	});

	it('handles plural possessives and elided decades', () => {
		expect(smartQuotes("the Bisharas' collection in the '70s")).toBe(
			'the Bisharas’ collection in the ’70s'
		);
	});

	it('never touches quotes inside HTML tags', () => {
		expect(smartQuotes('see <a href="https://example.org/l\'a">"the catalogue"</a>.')).toBe(
			'see <a href="https://example.org/l\'a">“the catalogue”</a>.'
		);
	});

	it('reads quote direction through tags', () => {
		expect(smartQuotes('"<em>Love</em>"')).toBe('“<em>Love</em>”');
		expect(smartQuotes('word <em>"Love"</em> word')).toBe('word <em>“Love”</em> word');
	});

	it('leaves curly, German and Arabic text unchanged and is idempotent', () => {
		for (const text of ['Fatima Ismail’s Palace', '„Kunst für alle“', 'متحف حسن حشمت']) {
			expect(smartQuotes(text)).toBe(text);
		}
		const once = smartQuotes('He said "it\'s `fine`".');
		expect(smartQuotes(once)).toBe(once);
	});
});

describe('typeset', () => {
	it('converts prose fields at any depth and leaves files, URLs and ids alone', () => {
		const record = {
			name: 'Musée de l`Homme',
			slug: 'musee-de-l-homme',
			image: 'Musée_de_l`Homme.jpg',
			images: [{ src: "a'b.jpg", caption: "Karin Haude's works" }],
			links: [{ label: 'The "museum"', url: "https://example.org/?q='x'" }],
			aliases: ["l'Homme"]
		};
		expect(typeset(record)).toEqual({
			name: 'Musée de l’Homme',
			slug: 'musee-de-l-homme',
			image: 'Musée_de_l`Homme.jpg',
			images: [{ src: "a'b.jpg", caption: 'Karin Haude’s works' }],
			links: [{ label: 'The “museum”', url: "https://example.org/?q='x'" }],
			aliases: ['l’Homme']
		});
	});

	it('cannot change a slug: every quote slugifies to the same hyphen', () => {
		for (const name of ["Musée de l'Homme", 'Musée de l`Homme', '"The Dawn of Egypt"']) {
			expect(slugify(smartQuotes(name))).toBe(slugify(name));
		}
	});
});

describe('proseProblems', () => {
	it('flags quotes facing the wrong way and quotations left open', () => {
		expect(proseProblems('Mecca“.')).toContain('a closing quote is typed as an opening “');
		expect(proseProblems('it was ”Love“ indeed')).toContain(
			'an opening quote is typed as a closing ”'
		);
		expect(proseProblems('She wrote: “In one of his earliest exhibitions.')).toContain(
			'a quotation is not closed (or not opened)'
		);
	});

	it('accepts balanced English quotes and German „…“ passages', () => {
		expect(proseProblems('a diploma in “Decoration and Woodcarving” from Cairo')).toEqual([]);
		expect(proseProblems('„Bei der Eröffnung der Ausstellung.“')).toEqual([]);
	});

	it('flags filename captions and a misspelt artist name', () => {
		expect(proseProblems('Musée_de_l’Homme (https://example.org/)', 'imageCaption')).toEqual([
			'the caption looks like a filename'
		]);
		expect(proseProblems('works by Hassan Heshamt')).toEqual([
			'the artist’s name may be misspelled'
		]);
	});

	it('reports problems by field across a record', () => {
		expect(
			typographyIssues({ name: 'Ok', images: [{ src: 'a_b.jpg', caption: 'a_b.jpg' }] })
		).toEqual(['caption: the caption looks like a filename']);
	});
});
