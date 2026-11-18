<script lang="ts">
	import {
		memoirBook as book,
		memoirCounts as counts,
		memoirMethod as method
	} from '#lib/data/memoir.js';

	const SOURCE_URL =
		'https://github.com/ZMO-Berlin/Global-Heshmat/tree/main/svelte-app/docs/autobiography';
</script>

<section id="method" class="method" aria-labelledby="method-heading">
	<h3 id="method-heading">How this Memoir page was made</h3>
	<p class="experimental">
		This page is an experiment in reading a book with AI tools. Every name above was extracted
		automatically and has not yet been checked against the book. The page numbers open the passage
		that names each one, in the book’s text as transcribed by machine and not proofread. Until an
		editor has validated them, expect mistaken or doubled names, approximate spellings and dates,
		and places shown in the wrong position.
	</p>
	<p>
		Names, places and exhibitions that already have an entry on this platform have been researched
		and cross-checked with other sources outside the autobiography.
	</p>
	<ol class="steps">
		<li>
			<h4>The scan</h4>
			<p>
				The {book.year} edition published by {book.publisher} ({book.publisherEn}), in an
				open-access scan from ZMO’s repository (DOI:
				<a href={book.doi} rel="external">{book.doi.replace('https://doi.org/', '')}</a>). Its {method.pdfPages}
				PDF pages hold mostly two-page spreads, which were split into {method.pages} single pages.
			</p>
		</li>
		<li>
			<h4>Text recognition</h4>
			<p>
				A language model (Claude Sonnet 5.5) transcribed the Arabic text page by page. The
				transcription is not proofread; a sample page matched the scan word for word, and two
				sentences the model added to describe photographs were removed by hand.
			</p>
		</li>
		<li>
			<h4>Sections and paragraphs</h4>
			<p>
				The text was divided along the book’s own headings into {method.sections} sections and
				{method.paragraphs} paragraphs, each keeping its printed page number. These are the page numbers
				cited on this page.
			</p>
		</li>
		<li>
			<h4>Extraction</h4>
			<p>
				Section by section, with the whole book as context, the model listed the people, places,
				organisations, works and exhibitions it names: {method.mentions} mentions in all. Each was checked
				by a script against the text; {method.notFound} quoted names could not be found there and are
				flagged for the editor.
			</p>
		</li>
		<li>
			<h4>Merging</h4>
			<p>
				The mentions formed {method.firstPass} distinct names. A second pass of the model merged spellings
				of the same name ({method.merges} merges) and set aside {method.drops} entries that are not names
				to keep, such as the narrator himself. {method.entities} remain.
			</p>
		</li>
		<li>
			<h4>Places on the map</h4>
			<p>
				The model wrote a search query for each place and OpenStreetMap’s Nominatim service returned
				coordinates; {method.placesByHand} queries were corrected by hand, and
				{method.placesLocated} of {counts.place} places were located. Each is shown at a single point,
				so a city or district stands at its centre and a street at one spot along it.
			</p>
		</li>
		<li class="pending">
			<h4>Editorial validation</h4>
			<p>
				Still to come: each name, its Arabic form, dates and links to this collection will be
				checked against the book. Until then, how often a name occurs reflects how often the book
				mentions it, not its importance in Heshmat’s life.
			</p>
		</li>
	</ol>
	<p>
		The scripts, the intermediate files and the review sheet are published with the
		<a href={SOURCE_URL} rel="external">source code of this site</a>. Run of {method.date}.
	</p>
</section>

<style>
	.experimental {
		padding: var(--space-4) var(--space-5);
		border: 1px solid rgb(var(--color-search-rgb) / 0.35);
		border-radius: var(--radius-md);
		background: var(--color-search-light);
		color: var(--color-text);
	}
	.steps {
		counter-reset: step;
		list-style: none;
		display: grid;
		gap: var(--space-5);
		margin-block: var(--space-6);
		max-width: 75ch;
	}
	.steps li {
		counter-increment: step;
		display: grid;
		grid-template-columns: 3rem 1fr;
		column-gap: var(--space-3);
	}
	.steps li::before {
		content: counter(step);
		grid-row: span 2;
		font: var(--weight-medium) var(--text-4xl) / 1 var(--font-display);
		color: var(--color-accent-text);
	}
	.steps h4 {
		margin: 0;
		font: var(--weight-semibold) var(--text-sm) var(--font-body);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-accent-text);
	}
	.steps p {
		margin-top: var(--space-1);
	}
	.steps .pending::before {
		color: var(--color-search-text);
	}
	.steps .pending h4 {
		color: var(--color-search-text);
	}
</style>
