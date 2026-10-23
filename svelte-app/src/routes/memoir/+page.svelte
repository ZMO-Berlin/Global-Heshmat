<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- record links come from the browse store's resolved builders; #ids are in-page anchors; the rest are external. */
	import Seo from '$lib/components/Seo.svelte';
	import { onMount, tick } from 'svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { resolve } from '$app/paths';
	import {
		MAPPED_LEVELS,
		memoirBook as book,
		memoirCounts as counts,
		memoirMethod as method,
		ofType,
		mentionLabel,
		pageLabel,
		type MemoirEntity
	} from '$lib/data/memoir';
	import { entryKey, entryTitle, type Entry } from '$lib/utils/collection';
	import { countLabel } from '$lib/utils/text';
	import { getBrowseStore } from '$lib/stores/browse.svelte';

	const store = getBrowseStore();
	// MapLibre is a large optional renderer: like the main map, it loads after the page.
	type MapConstructor = (typeof import('$lib/components/MemoirMap.svelte'))['default'];
	let MemoirMap = $state<MapConstructor>();
	let mapFailed = $state(false);
	onMount(() => {
		import('$lib/components/MemoirMap.svelte')
			.then((module) => (MemoirMap = module.default))
			.catch(() => (mapFailed = true));
	});
	const SOURCE_URL =
		'https://github.com/ZMO-Berlin/Global-Heshmat/tree/main/svelte-app/docs/autobiography';
	const PEOPLE_PER_PAGE = 20;

	const byMentions = (a: MemoirEntity, b: MemoirEntity) =>
		b.mentions - a.mentions || a.name.localeCompare(b.name);

	// Places: cities, districts, streets and sites on the map; countries and regions listed.
	const places = ofType('place').sort(byMentions);
	const mapped = places.filter((p) => p.lat !== undefined && MAPPED_LEVELS.has(p.level!));
	const wider = places.filter((p) => !mapped.includes(p));

	// Exhibitions by year, the undated ones last.
	const exhibitions = ofType('exhibition');
	const dated = exhibitions.filter((e) => e.years?.length);
	const undated = exhibitions
		.filter((e) => !e.years?.length)
		.sort((a, b) => a.name.localeCompare(b.name));
	const years = [...new Set(dated.map((e) => e.years![0]))].sort((a, b) => a - b);
	const byYear = years.map((year) => ({
		year,
		items: dated.filter((e) => e.years![0] === year).sort((a, b) => a.name.localeCompare(b.name))
	}));
	const firstDecade = Math.floor(years[0] / 10) * 10;
	const lastDecade = Math.ceil((years.at(-1)! + 1) / 10) * 10;
	const span = lastDecade - firstDecade;
	const tallest = Math.max(...byYear.map((y) => y.items.length));
	const decades = Array.from({ length: span / 10 + 1 }, (_, i) => firstDecade + i * 10);

	// People, ranked by how often the book names them.
	const persons = ofType('person').sort(byMentions);
	const mostNamed = persons[0].mentions;
	const peoplePages = Math.ceil(persons.length / PEOPLE_PER_PAGE);
	let peoplePage = $state(1);
	const firstShown = $derived((peoplePage - 1) * PEOPLE_PER_PAGE);
	const shownPeople = $derived(persons.slice(firstShown, firstShown + PEOPLE_PER_PAGE));
	let peopleHeading: HTMLHeadingElement;
	async function showPeoplePage(page: number) {
		peoplePage = page;
		// Once the new page is drawn, bring its heading to the top of the scroll area and
		// move focus there, so the page is read (and tabbed through) from its first name.
		// The jump is instant, like turning a page (smooth scrolling stalls in this fixed
		// scroll container).
		await tick();
		peopleHeading.scrollIntoView({ block: 'start' });
		peopleHeading.focus({ preventScroll: true });
	}

	// Site records the book refers to, with the names it uses for them.
	const entries = new Map<string, Entry>([...artworks, ...residences].map((e) => [entryKey(e), e]));
	// The extraction only links slugs that exist; the profiles themselves stay on the People routes.
	const profileHref = (record: string) =>
		resolve('/people/[slug]', { slug: record.slice('person:'.length) });
	const linked = ofType('artwork')
		.concat(ofType('organisation'), ofType('place'))
		.filter((e) => e.record && entries.has(e.record));
	const records = [...new Set(linked.map((e) => e.record!))]
		.map((key) => {
			const names = linked.filter((e) => e.record === key);
			return {
				key,
				entry: entries.get(key)!,
				names,
				mentions: names.reduce((sum, e) => sum + e.mentions, 0)
			};
		})
		.sort(
			(a, b) => b.mentions - a.mentions || entryTitle(a.entry).localeCompare(entryTitle(b.entry))
		);
	const profiled = persons.filter((p) => p.record?.startsWith('person:'));

	const osmUrl = (osm: string) => `https://www.openstreetmap.org/${osm}`;
	const levelLabel: Record<string, string> = {
		country: 'country',
		region: 'region',
		city: 'city',
		district: 'district',
		street: 'street or square',
		site: 'site'
	};
</script>

<Seo
	title="Memoir — Global Heshmat"
	description="The people, places, exhibitions and works named in Hassan Heshmat’s autobiography Tajārubī fī al-fann wa-al-ḥayāh (1997), extracted with an experimental AI-assisted method."
	path="/memoir/"
/>
<div class="research-page">
	<article class="research-inner memoir" aria-labelledby="memoir-heading">
		<header class="memoir-head">
			<h2 id="memoir-heading">Memoir</h2>
			<p class="book-title">
				<span lang="ar" dir="rtl">{book.titleAr}</span>
				<span><cite>{book.title}</cite> · {book.translation} · {book.year}</span>
			</p>
			<p class="lede">
				In his autobiography Hassan Heshmat recounts his training, his studio at Ain Shams, the
				exhibitions he held in Egypt and abroad and the public works he built. This page gathers the {counts.person}
				people, {counts.place} places, {counts.exhibition} exhibitions and {counts.artwork} works it names.
				The names were read from the book with an experimental, AI-assisted method that has not yet been
				checked by an editor: see <a href="#method">How this page was made</a>. The book itself is
				available as an <a href={book.doi} rel="external">open-access scan</a>.
			</p>
			<nav class="memoir-index" aria-label="On this page">
				<ul>
					<li><a href="#places">Places</a></li>
					<li><a href="#exhibitions">Exhibitions</a></li>
					<li><a href="#people">People</a></li>
					<li><a href="#collection">In the collection</a></li>
					<li><a href="#method">How this page was made</a></li>
				</ul>
			</nav>
		</header>

		<section id="places" aria-labelledby="places-heading">
			<h3 id="places-heading">Places</h3>
			<p>
				{countLabel(
					mapped.length,
					'city, district, street or site',
					'cities, districts, streets and sites'
				)}
				the book names, each circle sized by how often. Select one for its pages. Positions are automatic
				and approximate.
			</p>
			<div class="map-frame">
				{#if MemoirMap}<MemoirMap places={mapped} />{:else if mapFailed}<p class="map-note">
						The map could not be loaded. Every place is also listed below.
					</p>{/if}
			</div>
			<h4>Countries and regions</h4>
			<ul class="chips">
				{#each wider as place (place.id)}<li>
						<span dir="auto">{place.name}</span>
						<span class="count" aria-label={countLabel(place.mentions, 'mention')}
							>{place.mentions}</span
						>
					</li>{/each}
			</ul>
			<details>
				<summary>All {places.length} places, with their pages</summary>
				<table>
					<thead
						><tr
							><th scope="col">Place</th><th scope="col">Arabic</th><th scope="col">Kind</th><th
								scope="col">Mentions</th
							><th scope="col">Book pages</th></tr
						></thead
					>
					<tbody>
						{#each places as place (place.id)}<tr>
								<th scope="row" dir="auto"
									>{#if place.osm}<a href={osmUrl(place.osm)} rel="external">{place.name}</a
										>{:else}{place.name}{/if}</th
								>
								<td lang="ar" dir="rtl">{place.nameAr}</td>
								<td>{place.level ? levelLabel[place.level] : 'not located'}</td>
								<td class="num">{place.mentions}</td>
								<td>{pageLabel(place.pages, 12)}</td>
							</tr>{/each}
					</tbody>
				</table>
			</details>
		</section>

		<section id="exhibitions" aria-labelledby="exhibitions-heading">
			<h3 id="exhibitions-heading">Exhibitions</h3>
			<p>
				{countLabel(dated.length, 'dated exhibition')} from {years[0]} to {years.at(-1)}, solo and
				group, as the book recounts them.
			</p>
			<figure class="histogram">
				<svg
					viewBox="0 0 {span * 10} 64"
					preserveAspectRatio="none"
					role="img"
					aria-label="Exhibitions per year, {years[0]} to {years.at(
						-1
					)}; the list below gives each one."
				>
					{#each byYear as { year, items } (year)}<rect
							x={(year - firstDecade) * 10 + 1.5}
							y={64 - (items.length / tallest) * 60}
							width="7"
							height={(items.length / tallest) * 60}
							rx="1.5"
						/>{/each}
				</svg>
				<div class="axis" aria-hidden="true">
					{#each decades as decade (decade)}<span
							style:left="{((decade - firstDecade) / span) * 100}%">{decade}</span
						>{/each}
				</div>
			</figure>
			<ol class="timeline">
				{#each byYear as { year, items } (year)}<li>
						<span class="year">{year}</span>
						<ul>
							{#each items as exhibition (exhibition.id)}<li>
									<span class="name" dir="auto">{exhibition.name}</span>
									<span class="pages">{pageLabel(exhibition.pages)}</span>
								</li>{/each}
						</ul>
					</li>{/each}
				{#if undated.length}<li>
						<span class="year">Year not given</span>
						<ul>
							{#each undated as exhibition (exhibition.id)}<li>
									<span class="name" dir="auto">{exhibition.name}</span>
									<span class="pages">{pageLabel(exhibition.pages)}</span>
								</li>{/each}
						</ul>
					</li>{/if}
			</ol>
		</section>

		<section id="people" aria-labelledby="people-heading">
			<h3 id="people-heading" bind:this={peopleHeading} tabindex="-1">People</h3>
			<p>
				{countLabel(persons.length, 'person', 'people')} named in the book: teachers, critics and fellow
				artists, ministers, diplomats and patrons. Those with a profile on this site link to it.
			</p>
			<p class="pager-status" role="status">
				{firstShown + 1}–{firstShown + shownPeople.length} of {persons.length}, most named first
			</p>
			<ol class="people" start={firstShown + 1}>
				{#each shownPeople as entity (entity.id)}<li>
						<div class="who">
							<span class="name" dir="auto"
								>{#if entity.record?.startsWith('person:')}<a href={profileHref(entity.record)}
										>{entity.name}</a
									>{:else}{entity.name}{/if}</span
							>
							<span class="ar" lang="ar" dir="rtl">{entity.nameAr}</span>
						</div>
						<p class="desc">{entity.description}</p>
						<div class="tally">
							<span class="bar" style:inline-size="{(entity.mentions / mostNamed) * 100}%"></span>
							<span>{mentionLabel(entity)}</span>
						</div>
					</li>{/each}
			</ol>
			<nav class="pager" aria-label="Pages of people">
				<button
					type="button"
					disabled={!store.ready || peoplePage === 1}
					onclick={() => showPeoplePage(peoplePage - 1)}
					><ChevronLeft size={18} aria-hidden="true" />Previous</button
				>
				<ol>
					{#each { length: peoplePages }, index (index)}{@const page = index + 1}
						<li>
							<button
								type="button"
								class="page"
								disabled={!store.ready}
								aria-current={page === peoplePage ? 'page' : undefined}
								aria-label="Page {page}"
								onclick={() => showPeoplePage(page)}>{page}</button
							>
						</li>{/each}
				</ol>
				<button
					type="button"
					disabled={!store.ready || peoplePage === peoplePages}
					onclick={() => showPeoplePage(peoplePage + 1)}
					>Next<ChevronRight size={18} aria-hidden="true" /></button
				>
			</nav>
		</section>

		<section id="collection" aria-labelledby="collection-heading">
			<h3 id="collection-heading">In the collection</h3>
			<p>
				The book mentions {countLabel(records.length, 'work or site')} recorded in this collection and
				{countLabel(profiled.length, 'person', 'people')} with a profile here.
			</p>
			<ul class="records">
				{#each records as { key, entry, names, mentions } (key)}<li>
						<a href={store.entryHref(entry, { view: 'gallery' })} dir="auto">{entryTitle(entry)}</a>
						<span class="as"
							>named as {#each names as name, i (name.id)}{i ? '; ' : ''}<span dir="auto"
									>{name.name}</span
								>{/each} · {countLabel(mentions, 'mention')}</span
						>
					</li>{/each}
			</ul>
			<h4>People with a profile</h4>
			<ul class="records">
				{#each profiled as entity (entity.id)}
					<li>
						<a href={profileHref(entity.record!)} dir="auto">{entity.name}</a>
						<span class="as">{mentionLabel(entity)}</span>
					</li>{/each}
			</ul>
		</section>

		<section id="method" class="method" aria-labelledby="method-heading">
			<h3 id="method-heading">How this page was made</h3>
			<p class="experimental">
				This page is an experiment in reading a book with AI tools. Every name above was extracted
				automatically and has not yet been checked against the book. Until an editor has validated
				them, expect mistaken or doubled names, approximate spellings and dates, and places shown in
				the wrong position.
			</p>
			<ol class="steps">
				<li>
					<h4>The scan</h4>
					<p>
						The {book.year} edition published by {book.publisher}, in an
						<a href={book.doi} rel="external">open-access scan</a>. Its {method.pdfPages} PDF pages hold
						mostly two-page spreads, which were split into {method.pages} single pages.
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
						organisations, works and exhibitions it names: {method.mentions} mentions in all. Each was
						checked by a script against the text; {method.notFound} quoted names could not be found there
						and are flagged for the editor.
					</p>
				</li>
				<li>
					<h4>Merging</h4>
					<p>
						The mentions formed {method.firstPass} distinct names. A second pass of the model merged spellings
						of the same name ({method.merges} merges) and set aside {method.drops} entries that are not
						names to keep, such as the narrator himself. {method.entities} remain.
					</p>
				</li>
				<li>
					<h4>Places on the map</h4>
					<p>
						The model wrote a search query for each place and OpenStreetMap’s Nominatim service
						returned coordinates; {method.placesByHand} queries were corrected by hand, and
						{method.placesLocated} of {counts.place} places were located. Each is shown at a single point,
						so a city or district stands at its centre and a street at one spot along it.
					</p>
				</li>
				<li class="pending">
					<h4>Editorial validation</h4>
					<p>
						Still to come: each name, its Arabic form, dates and links to this collection will be
						checked against the book. Until then, how often a name occurs reflects how often the
						book mentions it, not its importance in Heshmat’s life.
					</p>
				</li>
			</ol>
			<p>
				The scripts, the intermediate files and the review sheet are published with the
				<a href={SOURCE_URL} rel="external">source code of this site</a>. Run of {method.date}.
			</p>
		</section>
	</article>
</div>

<style>
	.memoir-head {
		margin-bottom: var(--space-7);
	}
	.book-title {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-4);
		margin-top: 0;
	}
	.book-title [lang='ar'] {
		font-size: var(--text-2xl);
		color: var(--color-ink);
	}
	.lede {
		max-width: 70ch;
		font-size: var(--text-md);
	}
	.memoir-index ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-4);
		list-style: none;
	}
	.memoir-index a {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: var(--space-1) var(--space-3-5);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		font-size: var(--text-sm);
		text-decoration: none;
	}
	.memoir-index a:hover {
		border-color: var(--color-accent);
	}
	section {
		padding-block: var(--space-7);
		border-top: 1px solid var(--color-border);
		scroll-margin-top: var(--space-4);
	}
	section > p {
		max-width: 70ch;
	}
	h4 {
		margin: var(--space-6) 0 var(--space-3);
		font: var(--weight-semibold) var(--text-sm) var(--font-body);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-accent-text);
	}
	.map-frame {
		position: relative;
		height: clamp(320px, 55vh, 520px);
		margin-top: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface-image);
	}
	.research-inner .map-note {
		padding: var(--space-5);
		text-align: center;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
	}
	.chips li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-1) var(--space-1) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		font-size: var(--text-sm);
	}
	.count {
		min-width: 1.75em;
		padding: 0 var(--space-1-5);
		border-radius: var(--radius-pill);
		background: var(--color-accent-light);
		color: var(--color-accent-text);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	details {
		margin-top: var(--space-5);
	}
	#people-heading {
		scroll-margin-top: var(--space-5);
	}
	#people-heading:focus {
		outline: none;
	}
	.research-inner .pager-status {
		margin: var(--space-4) 0 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}
	.pager {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-6);
	}
	.pager ol {
		display: flex;
		gap: var(--space-1-5);
		list-style: none;
	}
	.pager button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		min-width: 44px;
		border-radius: var(--radius-pill);
		font-variant-numeric: tabular-nums;
	}
	.pager button:hover:not(:disabled) {
		border-color: var(--color-accent);
	}
	.pager button:disabled:not([aria-current]) {
		color: var(--color-text-muted);
		cursor: default;
		opacity: 0.6;
	}
	.pager .page[aria-current='page'] {
		border-color: var(--color-accent);
		background: var(--color-accent-light);
		color: var(--color-accent-text);
		font-weight: var(--weight-semibold);
	}
	summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		color: var(--color-primary-text);
		cursor: pointer;
	}
	table {
		width: 100%;
		margin-top: var(--space-3);
		border-collapse: collapse;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: var(--space-2) var(--space-3) var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-light);
		text-align: start;
		vertical-align: baseline;
	}
	thead th {
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
	}
	tbody th {
		font-weight: var(--weight-medium);
	}
	td[lang='ar'] {
		font-size: var(--text-base);
	}
	.num {
		text-align: end;
	}
	.histogram {
		margin: var(--space-5) 0 var(--space-6);
	}
	.histogram svg {
		display: block;
		width: 100%;
		height: 72px;
		fill: var(--color-accent);
	}
	.axis {
		position: relative;
		height: 1.5rem;
		border-top: 1px solid var(--color-text-muted);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}
	.axis span {
		position: absolute;
		top: var(--space-1);
		transform: translateX(-50%);
	}
	.axis span:first-child {
		transform: none;
	}
	.axis span:last-child {
		transform: translateX(-100%);
	}
	.timeline {
		list-style: none;
		display: grid;
		gap: var(--space-4);
	}
	.timeline > li {
		display: grid;
		grid-template-columns: 7.5rem 1fr;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border-light);
	}
	.year {
		font: var(--weight-semibold) var(--text-2xl) / 1 var(--font-display);
		color: var(--color-ink);
		font-variant-numeric: lining-nums tabular-nums;
	}
	.timeline ul {
		list-style: none;
		display: grid;
		gap: var(--space-2);
	}
	.timeline .name,
	.who .name {
		font: var(--weight-semibold) var(--text-xl) / var(--leading-snug) var(--font-display);
		color: var(--color-ink);
	}
	.pages,
	.as {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	.people {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-5) var(--space-7);
		margin-top: var(--space-5);
	}
	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0 var(--space-3);
	}
	.who .ar {
		color: var(--color-text-secondary);
	}
	.research-inner .desc {
		margin: var(--space-1) 0 var(--space-2);
		font-size: var(--text-sm);
	}
	.tally {
		display: grid;
		gap: var(--space-1);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	.bar {
		display: block;
		block-size: 3px;
		min-inline-size: 4px;
		border-radius: var(--radius-pill);
		background: var(--color-accent);
	}
	.records {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-3) var(--space-7);
		margin-top: var(--space-4);
	}
	.records a {
		font: var(--weight-semibold) var(--text-lg) / var(--leading-snug) var(--font-display);
	}
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
	@media (max-width: 600px) {
		.research-inner {
			padding: var(--space-4);
		}
		.timeline > li {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
		table thead {
			display: none;
		}
		table,
		tbody,
		tr,
		th,
		td {
			display: block;
		}
		tr {
			padding-block: var(--space-2);
			border-bottom: 1px solid var(--color-border-light);
		}
		th,
		td {
			padding: 0;
			border: 0;
		}
	}
</style>
