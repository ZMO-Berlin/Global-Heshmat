<script lang="ts">
	import type { ArtworkImage } from '$lib/data/types';
	import { mediaId, imageAlt } from '$lib/utils/collection';
	import MediaImage from './MediaImage.svelte';
	import MediaCaption from './MediaCaption.svelte';
	let { images, name }: { images: ArtworkImage[]; name: string } = $props();
	let first = $state(0);
	let second = $state(1);
</script>

<details class="comparison">
	<summary>Compare two images</summary>
	<p class="comparison-note">
		Choose photographs or documents to inspect together. Their order does not imply a
		before-and-after relationship.
	</p>
	<div class="comparison-grid">
		{#each ['First', 'Second'] as label, column (label)}
			{@const index = column === 0 ? first : second}
			{@const selected = images[index]}
			<figure>
				<label
					>{label} image
					<select
						aria-label={`${label} image`}
						value={index}
						onchange={(event) => {
							if (column === 0) first = Number(event.currentTarget.value);
							else second = Number(event.currentTarget.value);
						}}
					>
						{#each images as image, i (mediaId(image))}<option value={i}
								>{i + 1}: {image.caption || name}</option
							>{/each}
					</select>
				</label>
				<div class="comparison-image">
					<MediaImage
						src={selected.src}
						alt={imageAlt(selected, name)}
						size="web"
						sizes="(max-width: 600px) 90vw, 40vw"
					/>
				</div>
				<figcaption>
					<MediaCaption image={selected} fallback={name} />{#if !selected.date}<p>
							Date not documented separately.
						</p>{/if}
				</figcaption>
			</figure>
		{/each}
	</div>
</details>

<style>
	.comparison {
		margin: var(--space-5) var(--gallery-content-inset, 0px);
	}
	summary {
		cursor: pointer;
		min-height: 44px;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}
	.comparison-note {
		margin-block: var(--space-3);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}
	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}
	label {
		display: grid;
		gap: var(--space-2);
	}
	select {
		min-height: 44px;
		width: 100%;
		font: inherit;
		color: var(--color-ink);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}
	.comparison-image {
		height: 340px;
		margin-block: var(--space-3);
	}
	figcaption {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	@media (max-width: 600px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}
		.comparison-image {
			height: 260px;
		}
	}
</style>
