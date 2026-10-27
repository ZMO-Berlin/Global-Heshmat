<script lang="ts">
	import { ChevronLeft, ChevronRight, TriangleAlert } from '@lucide/svelte';
	import { tick } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import {
		loadPassages,
		memoirBook as book,
		type MemoirEntity,
		type MemoirPassages
	} from '$lib/data/memoir';
	import { excerptRanges, segments } from '$lib/utils/passage';

	// The passages of the autobiography that name one entity, opened at the first
	// one on the page the reader chose; previous / next walk through the rest.
	let { entity, page, onclose }: { entity: MemoirEntity; page: number; onclose: () => void } =
		$props();

	let data = $state<MemoirPassages>();
	let failed = $state(false);
	let index = $state(0);
	let whole = $state(false);

	function load() {
		failed = false;
		loadPassages()
			.then((loaded) => {
				const list = loaded.entities[entity.id] ?? [];
				index = Math.max(
					0,
					list.findIndex((p) => loaded.paragraphs[p.p].pages.includes(page))
				);
				data = loaded;
			})
			.catch(() => (failed = true));
	}
	load();

	const list = $derived(data?.entities[entity.id] ?? []);
	const passage = $derived(list.at(index));
	const paragraph = $derived(passage && data?.paragraphs[passage.p]);
	const text = $derived(paragraph?.text ?? '');
	const excerpt = $derived(passage ? excerptRanges(text, passage.marks) : []);
	const shortened = $derived(
		excerpt.length !== 1 || excerpt[0][0] !== 0 || excerpt[0][1] !== text.length
	);
	const ranges = $derived<[number, number][]>(whole ? [[0, text.length]] : excerpt);

	let previous = $state<HTMLButtonElement>();
	let next = $state<HTMLButtonElement>();
	async function go(step: number) {
		index += step;
		whole = false;
		// At either end the button just pressed is disabled: keep focus in the dialog.
		await tick();
		const pressed = step > 0 ? next : previous;
		if (pressed?.disabled) (step > 0 ? previous : next)?.focus();
	}

	function pagesLabel(pages: number[]) {
		if (!pages.length) return 'No printed page number';
		return pages.length === 1 ? `p. ${pages[0]}` : `pp. ${pages[0]}–${pages.at(-1)}`;
	}
</script>

<svelte:document
	onkeydown={(event) => {
		if (event.key !== 'Escape') return;
		// Before the layout's own Escape handling, which would close other panels.
		event.stopPropagation();
		onclose();
	}}
/>

<Modal open title={entity.name} {onclose}>
	<div class="passage">
		<p class="name-ar" lang="ar" dir="rtl">{entity.nameAr}</p>
		{#if failed}
			<p>
				The passage could not be loaded. Check the connection and <button
					type="button"
					class="inline"
					onclick={load}>try again</button
				>.
			</p>
		{:else if !data}
			<p role="status">Loading the passage…</p>
		{:else if !passage || !paragraph}
			<p>No passage of the book is recorded for this name.</p>
		{:else}
			<p class="where">
				<span>{pagesLabel(paragraph.pages)}</span>
				<span class="section" lang="ar" dir="rtl">{data.sections[paragraph.section]}</span>
			</p>
			<blockquote lang="ar" dir="rtl" cite={book.doi}>
				{#each ranges as range (range[0])}{#if range[0] > 0}<span class="gap" aria-hidden="true"
							>…
						</span>{/if}{#each segments(text, passage.marks, range) as segment, i (i)}{#if segment.mark}<mark
								>{segment.text}</mark
							>{:else}{segment.text}{/if}{/each}{/each}{#if ranges.at(-1)![1] < text.length}<span
						class="gap"
						aria-hidden="true"
					>
						…</span
					>{/if}
			</blockquote>
			{#if shortened}
				<button type="button" class="inline" onclick={() => (whole = !whole)}
					>{whole
						? `Show only the sentences naming ${entity.name}`
						: 'Show the whole paragraph'}</button
				>
			{/if}
			{#each passage.missing as form (form)}
				<p class="warning">
					<TriangleAlert size={18} aria-hidden="true" />
					<span
						>The extraction quoted <q><span lang="ar" dir="rtl">{form}</span></q> from this paragraph,
						but the form is not in its text. Check the scan.</span
					>
				</p>
			{/each}
			{#if list.length > 1}
				<nav class="steps" aria-label="Passages naming {entity.name}">
					<button type="button" bind:this={previous} disabled={index === 0} onclick={() => go(-1)}
						><ChevronLeft size={18} aria-hidden="true" />Previous</button
					>
					<span role="status">Passage {index + 1} of {list.length}</span>
					<button
						type="button"
						bind:this={next}
						disabled={index === list.length - 1}
						onclick={() => go(1)}>Next<ChevronRight size={18} aria-hidden="true" /></button
					>
				</nav>
			{/if}
		{/if}
		<p class="note">
			The text is an uncorrected machine transcription of the book, not proofread, and the names
			were found by an experimental method an editor has not yet checked. Compare with the
			<a href={book.doi} rel="external">open-access scan</a>.
		</p>
	</div>
</Modal>

<style>
	.passage {
		display: grid;
		gap: var(--space-4);
	}
	.passage > p {
		margin: 0;
	}
	.name-ar {
		font-size: var(--text-xl);
		color: var(--color-text-secondary);
	}
	.where {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}
	.where .section {
		font-size: var(--text-base);
	}
	blockquote {
		margin: 0;
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-sm);
		background: var(--color-surface-warm);
		color: var(--color-ink);
		font-size: var(--text-xl);
		line-height: 1.9;
		white-space: pre-line;
	}
	mark {
		padding: 0 0.1em;
		border-radius: 2px;
		background: var(--color-search-light);
		color: inherit;
		text-decoration: underline 2px var(--color-search);
		text-underline-offset: 0.35em;
		box-decoration-break: clone;
	}
	.gap {
		color: var(--color-text-muted);
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		min-height: 44px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		color: var(--color-primary-text);
		font: inherit;
		font-size: var(--text-base);
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		border-color: var(--color-accent);
	}
	button:disabled {
		color: var(--color-text-muted);
		cursor: default;
		opacity: 0.6;
	}
	button.inline {
		justify-self: start;
		min-height: 24px;
		padding: 0;
		border: 0;
		background: none;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.warning {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border: 1px solid rgb(var(--color-search-rgb) / 0.35);
		border-radius: var(--radius-md);
		background: var(--color-search-light);
		font-size: var(--text-base);
		color: var(--color-text);
	}
	.warning :global(svg) {
		flex: none;
		margin-top: 0.2em;
		color: var(--color-search-text);
	}
	.steps {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.steps [role='status'] {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 600px) {
		blockquote {
			padding: var(--space-3) var(--space-4);
			font-size: var(--text-lg);
		}
	}
	.passage .note {
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}
</style>
