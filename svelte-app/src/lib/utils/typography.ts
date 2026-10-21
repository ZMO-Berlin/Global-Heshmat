/**
 * Typographic quotes for editorial prose. Editors may type straight quotes,
 * or a backtick for an apostrophe; readers always see curly ones. Applied
 * when the data loads, so every surface (cards, albums, search, SEO,
 * exports) shows the same text. Slugs are unaffected: slugify() turns every
 * quote into the same hyphen.
 */

/** Tags are swapped for private-use characters while quotes are converted,
 * so attribute quotes (href="…") are never touched. */
const TAG = /<[^>]*>/g;
const PLACEHOLDER = /[-]/g;
/** An opening quote follows the start, a space, a bracket, a dash or a slash,
 * optionally through tags (`<em>"Love"</em>`). */
const OPENS = String.raw`(^|[\s([{—–/])([-]*)`;

function convert(text: string): string {
	return (
		text
			// An apostrophe inside a word, typed as ' or `: l’Homme, Egypt’s, 1970’s.
			.replace(/(?<=[\p{L}\p{N}])['`](?=[\p{L}\p{N}])/gu, '’')
			// Elided decades: ’70s.
			.replace(/'(?=\d0s\b)/g, '’')
			.replace(new RegExp(`${OPENS}'`, 'gu'), '$1$2‘')
			.replace(new RegExp(`${OPENS}"`, 'gu'), '$1$2“')
			// Everything left closes: end quotes and plural possessives (Heshmats’).
			.replace(/'/g, '’')
			.replace(/"/g, '”')
	);
}

export function smartQuotes(html: string): string {
	if (!/['"`]/.test(html)) return html;
	const tags: string[] = [];
	const text = html.replace(TAG, (tag) => String.fromCharCode(0xe000 + tags.push(tag) - 1));
	return convert(text).replace(PLACEHOLDER, (c) => tags[c.charCodeAt(0) - 0xe000]);
}

/** Fields that hold reader-facing prose, at any depth of a record. */
const PROSE = new Set([
	'name',
	'displayTitle',
	'siteName',
	'district',
	'aliases',
	'desc',
	'address',
	'years',
	'imageCaption',
	'videoCaption',
	'caption',
	'alt',
	'credit',
	'rights',
	'rightsHolder',
	'label',
	'title',
	'description',
	'fromName',
	'paragraphs',
	'notes',
	'text'
]);

/** A copy of an editorial record with smart quotes in its prose fields. */
export function typeset<T>(value: T, key = ''): T {
	if (typeof value === 'string') return (PROSE.has(key) ? smartQuotes(value) : value) as T;
	if (Array.isArray(value)) return value.map((item) => typeset(item, key)) as T;
	if (value && typeof value === 'object')
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeset(v, k)])) as T;
	return value;
}

const count = (text: string, mark: string) => text.split(mark).length - 1;

/** Quote and caption problems no converter can settle: they need an editor. */
export function proseProblems(text: string, key = ''): string[] {
	const prose = text.replace(TAG, ' ');
	const problems: string[] = [];
	// German „…“ quotation is deliberate in German passages; leave it to the editor.
	const german = prose.includes('„');
	if (!german && /[\p{L}\p{N}.,;:!?)]“(?=[\s.,;:!?)]|$)/u.test(prose))
		problems.push('a closing quote is typed as an opening “');
	if (/(?:^|[\s(])”(?=\p{L})/u.test(prose))
		problems.push('an opening quote is typed as a closing ”');
	if (!german && count(prose, '“') !== count(prose, '”'))
		problems.push('a quotation is not closed (or not opened)');
	if (/^caption$|^imageCaption$/.test(key) && /^\S*_\S*(\s|$)/.test(prose))
		problems.push('the caption looks like a filename');
	if (/\bHeshamt\b|\bHashmat\b/i.test(prose)) problems.push('the artist’s name may be misspelled');
	return problems;
}

/** Every prose field of a record that has a problem, as "field: problem". */
export function typographyIssues(value: unknown, key = ''): string[] {
	if (typeof value === 'string')
		return PROSE.has(key) ? proseProblems(value, key).map((problem) => `${key}: ${problem}`) : [];
	if (Array.isArray(value)) return value.flatMap((item) => typographyIssues(item, key));
	if (value && typeof value === 'object')
		return Object.entries(value).flatMap(([k, v]) => typographyIssues(v, k));
	return [];
}
