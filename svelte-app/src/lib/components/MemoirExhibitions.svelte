<script lang="ts">
	import MemoirPages from './MemoirPages.svelte';
	import { ofType, type MemoirEntity } from '#lib/data/memoir.js';
	import { exhibitionTimeline } from '#lib/data/memoir-view.js';
	import { countLabel } from '#lib/utils/text.js';

	let {
		onopen
	}: { onopen: (entity: MemoirEntity, page: number, opener: HTMLButtonElement) => void } = $props();

	const { dated, undated, years, byYear, firstDecade, span, tallest, decades } = exhibitionTimeline(
		ofType('exhibition')
	);
</script>

{#snippet exhibitionList(items: MemoirEntity[])}
	<ul>
		{#each items as exhibition (exhibition.id)}<li>
				<span class="name" dir="auto">{exhibition.name}</span>
				<span class="pages"><MemoirPages entity={exhibition} {onopen} /></span>
			</li>{/each}
	</ul>
{/snippet}

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
			{#each decades as decade (decade)}<span style:left="{((decade - firstDecade) / span) * 100}%"
					>{decade}</span
				>{/each}
		</div>
	</figure>
	<ol class="timeline">
		{#each byYear as { year, items } (year)}<li>
				<span class="year">{year}</span>
				{@render exhibitionList(items)}
			</li>{/each}
		{#if undated.length}<li>
				<span class="year">Year not given</span>
				{@render exhibitionList(undated)}
			</li>{/if}
	</ol>
</section>

<style>
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
	.name {
		font: var(--weight-semibold) var(--text-xl) / var(--leading-snug) var(--font-display);
		color: var(--color-ink);
	}
	.pages {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	@media (max-width: 600px) {
		.timeline > li {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
	}
</style>
