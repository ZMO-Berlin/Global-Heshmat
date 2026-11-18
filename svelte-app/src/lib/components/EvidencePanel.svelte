<script lang="ts">
	import SourceLink from './SourceLink.svelte';
	import type { Entry } from '#lib/utils/collection.js';
	import { precisionLabel } from '#lib/utils/evidence.js';
	import { entryKey, isToBeFound } from '#lib/utils/collection.js';
	import { recordUrl } from '#lib/utils/exports.js';
	import { REPOSITORY_URL } from '#lib/config.js';
	let { item }: { item: Entry } = $props();
	const precision = $derived(precisionLabel(item));
	const contributionUrl = $derived(
		`${REPOSITORY_URL}/issues/new?` +
			new URLSearchParams({
				template: 'artwork-location.yml',
				title: `Information about ${item.name}`,
				'record-reference': `${entryKey(item)} — ${recordUrl(item)}`
			})
	);
</script>

<section class="evidence" aria-label="Evidence and location">
	<h3>Evidence and location</h3>
	{#if precision}<p>{precision}.</p>{/if}
	{#if isToBeFound(item)}<p>
			The current location is unconfirmed. The marker represents the place recorded in this entry.
		</p>{/if}
	{#if item.updatedOn}<p>
			Record updated: <time datetime={item.updatedOn}>{item.updatedOn}</time>
		</p>{/if}
	{#if item.sources?.length}
		<ul>
			{#each item.sources as source, index (index)}<li>
					<SourceLink {source} />
					{#if source.checkedOn}
						· Checked <time datetime={source.checkedOn}>{source.checkedOn}</time>{/if}
				</li>{/each}
		</ul>
	{/if}
	{#if item.events?.length}
		<h3>Documented events</h3>
		<ol>
			{#each item.events as event (event.id)}<li>
					<strong
						>{event.qualifier && event.qualifier !== 'exact'
							? event.qualifier + ' '
							: ''}{event.date}{event.endDate ? '–' + event.endDate : ''}: {event.title}</strong
					>
					{#if event.description}<p>{event.description}</p>{/if}
					<ul>
						{#each event.sources as source, index (index)}<li>
								<SourceLink {source} />
							</li>{/each}
					</ul>
				</li>{/each}
		</ol>
	{/if}
	<a class="contribute" href={contributionUrl} target="_blank" rel="noopener noreferrer"
		>Suggest a correction or share evidence</a
	>
</section>

<style>
	.evidence {
		margin-top: var(--space-5);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}
	h3 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--color-ink);
	}
	p,
	ul,
	ol {
		margin-top: var(--space-2);
	}
	ul,
	ol {
		padding-inline-start: var(--space-5);
	}
	/* Global so the source links rendered by SourceLink share the style. */
	.evidence :global(a) {
		color: var(--color-primary-text);
		overflow-wrap: anywhere;
	}
	.contribute {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: var(--space-2);
	}
</style>
