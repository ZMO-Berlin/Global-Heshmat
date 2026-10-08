<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- The browse store resolves internal routes. */
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import SourceParagraph from '$lib/components/SourceParagraph.svelte';
	import { getPersonBySlug } from '$lib/data/people';
	import { artworks } from '$lib/data/artworks';
	import { residences } from '$lib/data/residences';
	import { entryKey, entryTitle } from '$lib/utils/collection';
	import { contextsFor, groupName, personExcerpt, personPath } from '$lib/utils/people';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const person = $derived(data.person);
	const store = getBrowseStore();
	const related = $derived(
		[...artworks, ...residences].filter((item) => person.relatedEntries.includes(entryKey(item)))
	);
	const contexts = $derived(contextsFor(person.slug));
	const reference = $derived(getPersonBySlug(person.seeAlso[0] ?? ''));
</script>

<Seo
	title={`${person.name} — Global Heshmat`}
	description={personExcerpt(person)}
	path={personPath(person.slug)}
/>
{#key page.url.pathname}
	<article class="research-page" aria-labelledby="person-heading">
		<div class="research-inner person-inner">
			<a class="back" href={store.peopleHref()}>Back to People</a>
			<h2 id="person-heading">{person.name}</h2>
			<nav class="group-links" aria-label="Groups">
				{#each person.groups as group (group)}<a
						href={store.peopleHref({ group, query: '', place: '' })}>{groupName(group)}</a
					>{/each}
			</nav>
			<div class="biography">
				{#each person.paragraphs as text, i (i)}<SourceParagraph
						{text}
						referenceHref={reference ? store.personHref(reference) : undefined}
					/>{/each}
				{#if person.seeAlso.length}<h3>See also</h3>
					<ul class="related-links">
						{#each person.seeAlso as slug (slug)}{@const other = getPersonBySlug(slug)!}
							<li><a href={store.personHref(other)}>{other.name}</a></li>{/each}
					</ul>{/if}
				{#each contexts as context (context.id)}
					<section class="context" aria-label="Shared passage">
						<h3>{context.people.map((slug) => getPersonBySlug(slug)!.name).join(' / ')}</h3>
						{#each context.paragraphs as text, i (i)}<SourceParagraph {text} />{/each}
						<ul class="related-links">
							{#each context.people.filter((slug) => slug !== person.slug) as slug (slug)}{@const other =
									getPersonBySlug(slug)!}
								<li><a href={store.personHref(other)}>{other.name}</a></li>{/each}
						</ul>
					</section>
				{/each}
				{#if person.notes.length}<section class="notes">
						<h3>Notes</h3>
						{#each person.notes as text, i (i)}<SourceParagraph {text} />{/each}
					</section>{/if}
				{#if person.sources.length}<section class="sources">
						<h3>Sources</h3>
						<ul>
							{#each person.sources as source, i (i)}<li>
									{#if source.url}<a href={source.url} target="_blank" rel="noopener noreferrer"
											>{source.label}</a
										>{:else}{source.label}{/if}
								</li>{/each}
						</ul>
					</section>{/if}
			</div>
			{#if related.length}<section class="related">
					<h3>Related collection entries</h3>
					<ul class="related-links">
						{#each related as item (entryKey(item))}<li>
								<a href={store.entryHref(item, { view: 'gallery' })}>{entryTitle(item)}</a>
							</li>{/each}
					</ul>
				</section>{/if}
		</div>
	</article>
{/key}

<style>
	.person-inner {
		max-width: 850px;
	}
	.back,
	.group-links a,
	.related-links a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.group-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin-bottom: var(--space-5);
		font-size: var(--text-sm);
	}
	.biography {
		max-width: 70ch;
	}
	.context,
	.notes,
	.sources,
	.related {
		margin-top: var(--space-7);
		padding-top: var(--space-5);
		border-top: 1px solid var(--color-border);
	}
	.related-links {
		list-style: none;
		padding: 0;
	}
	.sources li {
		overflow-wrap: anywhere;
		margin-block: var(--space-2);
	}
	@media (max-width: 600px) {
		.person-inner {
			padding: var(--space-4);
		}
	}
</style>
