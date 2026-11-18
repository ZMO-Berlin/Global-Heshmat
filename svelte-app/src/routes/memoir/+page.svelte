<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import MemoirPassage from '#lib/components/MemoirPassage.svelte';
	import MemoirPlaces from '#lib/components/MemoirPlaces.svelte';
	import MemoirExhibitions from '#lib/components/MemoirExhibitions.svelte';
	import MemoirPeople from '#lib/components/MemoirPeople.svelte';
	import MemoirCollection from '#lib/components/MemoirCollection.svelte';
	import MemoirMethod from '#lib/components/MemoirMethod.svelte';
	import { tick } from 'svelte';
	import {
		memoirBook as book,
		memoirCounts as counts,
		type MemoirEntity
	} from '#lib/data/memoir.js';
	import { bookStructuredData } from '#lib/utils/structured-data.js';

	// The passage dialog for a page number; closing it returns focus to that button
	// (Safari does not focus a clicked button, so the dialog cannot rely on it).
	let reading = $state<{ entity: MemoirEntity; page: number; opener: HTMLButtonElement }>();
	const openPassage = (entity: MemoirEntity, page: number, opener: HTMLButtonElement) =>
		(reading = { entity, page, opener });
	async function closePassage() {
		const opener = reading?.opener;
		reading = undefined;
		await tick();
		opener?.focus();
	}
</script>

<Seo
	title="Memoir — Global Heshmat"
	description="The people, places, exhibitions and works named in Hassan Heshmat’s autobiography Tajārubī fī al-fann wa-al-ḥayāh (1997), extracted with an experimental AI-assisted method."
	path="/memoir/"
	structuredData={bookStructuredData(book)}
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
				checked by an editor: see <a href="#method">How this Memoir page was made</a>. The book
				itself is available as an <a href={book.doi} rel="external">open-access scan</a>.
			</p>
			<nav class="memoir-index" aria-label="On this page">
				<ul>
					<li><a href="#places">Places</a></li>
					<li><a href="#exhibitions">Exhibitions</a></li>
					<li><a href="#people">People</a></li>
					<li><a href="#collection">In the collection</a></li>
					<li><a href="#method">How this Memoir page was made</a></li>
				</ul>
			</nav>
		</header>

		<MemoirPlaces onopen={openPassage} />
		<MemoirExhibitions onopen={openPassage} />
		<MemoirPeople onopen={openPassage} />
		<MemoirCollection onopen={openPassage} />
		<MemoirMethod />
	</article>
</div>
{#if reading}<MemoirPassage
		entity={reading.entity}
		page={reading.page}
		onclose={closePassage}
	/>{/if}

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
	/* The sections are the Memoir* components; their common frame is set here. */
	.memoir > :global(section) {
		padding-block: var(--space-7);
		border-top: 1px solid var(--color-border);
		scroll-margin-top: var(--space-4);
	}
	.memoir > :global(section > p) {
		max-width: 70ch;
	}
	@media (max-width: 600px) {
		.research-inner {
			padding: var(--space-4);
		}
	}
</style>
