/** A run of a passage's text, marked when it is a form of the name. */
export interface Segment {
	text: string;
	mark: boolean;
}

/** Paragraphs longer than this show only the sentences that name the entity. */
export const EXCERPT_FROM = 700;
/** The least text, in characters, an excerpt gives around a name. */
export const EXCERPT_CONTEXT = 250;

// A sentence ends at a full stop (also the OCR's ".." and "..."), a question or
// exclamation mark or a colon, followed by a space.
const SENTENCE_END = /[.!?؟:]+\s+/g;

function sentences(text: string): [number, number][] {
	const ranges: [number, number][] = [];
	let start = 0;
	for (const match of text.matchAll(SENTENCE_END)) {
		const end = match.index + match[0].length;
		ranges.push([start, end]);
		start = end;
	}
	if (start < text.length) ranges.push([start, text.length]);
	return ranges;
}

/** The parts of the text to show: the whole of it, or the sentences holding a mark. */
export function excerptRanges(
	text: string,
	marks: [number, number][],
	whole = false
): [number, number][] {
	if (whole || text.length <= EXCERPT_FROM || !marks.length) return [[0, text.length]];
	const all = sentences(text);
	const keep = new Set<number>();
	all.forEach(([start, end], i) => {
		if (!marks.some(([a, b]) => a < end && b > start)) return;
		// The OCR also writes ".." for a pause, so a "sentence" can be a fragment:
		// add the sentences that follow, then those before, up to some context.
		let [first, last] = [i, i];
		const length = () => all[last][1] - all[first][0];
		while (length() < EXCERPT_CONTEXT && last < all.length - 1) last++;
		while (length() < EXCERPT_CONTEXT && first > 0) first--;
		for (let j = first; j <= last; j++) keep.add(j);
	});
	const kept: [number, number][] = [];
	for (const i of [...keep].sort((a, b) => a - b)) {
		const last = kept.at(-1);
		if (last && last[1] === all[i][0]) last[1] = all[i][1];
		else kept.push([...all[i]]);
	}
	return kept;
}

/** The text of one range, split into marked and unmarked runs. */
export function segments(
	text: string,
	marks: [number, number][],
	[from, to]: [number, number]
): Segment[] {
	const out: Segment[] = [];
	let at = from;
	for (const [start, end] of marks) {
		if (end <= from || start >= to) continue;
		const a = Math.max(start, from);
		const b = Math.min(end, to);
		if (a > at) out.push({ text: text.slice(at, a), mark: false });
		out.push({ text: text.slice(a, b), mark: true });
		at = b;
	}
	if (at < to) out.push({ text: text.slice(at, to), mark: false });
	return out;
}
