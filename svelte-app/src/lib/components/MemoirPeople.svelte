<script lang="ts">
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import MemoirPages from './MemoirPages.svelte';
	import { ofType, type MemoirEntity } from '#lib/data/memoir.js';
	import { PEOPLE_PER_PAGE, pageCount, pageStart, rankPeople } from '#lib/data/memoir-view.js';
	import { countLabel } from '#lib/utils/text.js';
	import { getBrowseStore } from '#lib/stores/browse.svelte.js';

	let {
		onopen
	}: { onopen: (entity: MemoirEntity, page: number, opener: HTMLButtonElement) => void } = $props();

	const store = getBrowseStore();
	const { persons, mostNamed } = rankPeople(ofType('person'));
	const peoplePages = pageCount(persons.length);
	// The prerendered page lists everyone, so the names are there to read and
	// search without JavaScript; once hydrated the list is paged.
	let paged = $state(store.ready);
	let peoplePage = $state(1);
	const firstShown = $derived(paged ? pageStart(peoplePage) : 0);
	const shownPeople = $derived(
		paged ? persons.slice(firstShown, firstShown + PEOPLE_PER_PAGE) : persons
	);
	let section: HTMLElement;
	let list: HTMLOListElement;
	let peopleHeading: HTMLHeadingElement;

	$effect(() => {
		if (store.ready && !paged) void startPaging();
	});
	async function startPaging() {
		// When the visitor already stands past the list (a link to a later section,
		// say), the content after it would jump up as it shortens: keep it still.
		const scroller = section.closest('.research-page');
		const past =
			scroller && list.getBoundingClientRect().bottom <= scroller.getBoundingClientRect().top;
		const anchor = past ? section.nextElementSibling : null;
		const before = anchor?.getBoundingClientRect().top ?? 0;
		paged = true;
		await tick();
		// Browsers with scroll anchoring may have compensated already.
		if (anchor && scroller) scroller.scrollTop += anchor.getBoundingClientRect().top - before;
	}

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

	// The extraction only links slugs that exist; the profiles themselves stay on the People routes.
	const profileHref = (record: string) =>
		resolve('/people/[slug]', { slug: record.slice('person:'.length) });
</script>

<section id="people" aria-labelledby="people-heading" bind:this={section}>
	<h3 id="people-heading" bind:this={peopleHeading} tabindex="-1">People</h3>
	<p>
		{countLabel(persons.length, 'person', 'people')} named in the book: teachers, critics and fellow artists,
		ministers, diplomats and patrons. Those with a profile on this site link to it.
	</p>
	<p class="pager-status" role="status">
		{paged
			? `${firstShown + 1}–${firstShown + shownPeople.length} of ${persons.length}`
			: `All ${persons.length}`}, most named first
	</p>
	<ol class="people" start={firstShown + 1} bind:this={list}>
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
					<span
						>{countLabel(entity.mentions, 'mention')}{#if entity.pages.length}
							· <MemoirPages {entity} {onopen} />{/if}</span
					>
				</div>
			</li>{/each}
	</ol>
	{#if paged && peoplePages > 1}<nav class="pager" aria-label="Pages of people">
			<button
				type="button"
				disabled={peoplePage === 1}
				onclick={() => showPeoplePage(peoplePage - 1)}
				><ChevronLeft size={18} aria-hidden="true" />Previous</button
			>
			<ol>
				{#each { length: peoplePages }, index (index)}{@const page = index + 1}
					<li>
						<button
							type="button"
							class="page"
							aria-current={page === peoplePage ? 'page' : undefined}
							aria-label="Page {page}"
							onclick={() => showPeoplePage(page)}>{page}</button
						>
					</li>{/each}
			</ol>
			<button
				type="button"
				disabled={peoplePage === peoplePages}
				onclick={() => showPeoplePage(peoplePage + 1)}
				>Next<ChevronRight size={18} aria-hidden="true" /></button
			>
		</nav>{/if}
</section>

<style>
	#people-heading {
		scroll-margin-top: var(--space-5);
	}
	#people-heading:focus {
		outline: none;
	}
	:global(.research-inner) .pager-status {
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
	.who .name {
		font: var(--weight-semibold) var(--text-xl) / var(--leading-snug) var(--font-display);
		color: var(--color-ink);
	}
	.who .ar {
		color: var(--color-text-secondary);
	}
	:global(.research-inner) .desc {
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
</style>
