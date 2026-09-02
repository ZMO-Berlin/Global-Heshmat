<script lang="ts">
	import { ImageOff } from '@lucide/svelte';
	import { cardSrcSet, thumbUrl } from '$lib/utils/image';
	import { hideOnError } from '$lib/utils/hide-on-error';
	import MarkerGlyph from './MarkerGlyph.svelte';

	type MarkerKind = 'located' | 'search' | 'residence';

	let {
		href,
		name,
		city,
		country,
		image,
		markerKind,
		badge,
		detail,
		priority = false
	}: {
		href: string;
		name: string;
		city: string;
		country: string;
		image?: string;
		markerKind: MarkerKind;
		badge?: string;
		detail?: string;
		priority?: boolean;
	} = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- route parent passes an already-resolved SvelteKit URL -->
<a class="card" {href}>
	<div class="card-figure">
		{#if image}
			<img
				src={thumbUrl(image)}
				srcset={cardSrcSet(image)}
				sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 260px"
				alt=""
				loading={priority ? 'eager' : 'lazy'}
				fetchpriority={priority ? 'high' : 'auto'}
				decoding="async"
				use:hideOnError
			/>
		{:else}
			<div class="card-placeholder">
				<ImageOff size={28} strokeWidth={1.6} aria-hidden="true" />
				<span>Image coming soon</span>
			</div>
		{/if}
	</div>
	<div class="card-body">
		<h3 dir="auto">{name}</h3>
		<p class="card-meta" dir="auto">
			<MarkerGlyph kind={markerKind} size={10} />
			{city}, {country}
		</p>
		{#if detail}<p class="card-detail">{detail}</p>{/if}
		{#if badge}<p class="card-badge">{badge}</p>{/if}
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		position: relative;
		transition:
			transform var(--duration-slow) var(--ease-out),
			box-shadow var(--duration-slow) var(--ease-out),
			border-color var(--duration-slow) var(--ease-out);
	}
	.card:hover {
		transform: translateY(-3px);
		box-shadow:
			0 10px 24px -4px rgb(var(--color-header-bg-rgb) / 0.1),
			0 4px 8px -2px rgb(var(--color-header-bg-rgb) / 0.05);
		border-color: rgb(var(--color-accent-rgb) / 0.6);
	}
	.card-figure {
		aspect-ratio: 4 / 3;
		background: var(--color-surface-image);
		overflow: hidden;
		position: relative;
	}
	.card-figure img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition:
			transform var(--duration-slower) var(--ease-out),
			filter var(--duration-slower) var(--ease-out);
	}
	.card:hover .card-figure img {
		transform: scale(1.03);
		filter: brightness(1.02);
	}
	.card-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		color: var(--color-text-placeholder);
		font-family: var(--font-display);
		font-style: italic;
		font-size: var(--text-sm);
		text-align: center;
		padding: var(--space-3);
	}
	.card-body {
		padding: var(--space-3-5) var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		flex: 1;
		min-width: 0;
	}
	.card-body h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-snug);
		color: var(--color-ink);
		overflow-wrap: anywhere;
		transition: color var(--duration-base) var(--ease-out);
	}
	.card:hover .card-body h3 {
		color: var(--color-accent-text);
	}
	.card-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		overflow-wrap: anywhere;
	}
	.card-detail {
		font-size: var(--text-xs);
		font-style: italic;
		color: var(--color-text-muted);
	}
	.card-badge {
		align-self: flex-start;
		margin-top: auto;
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-search-light);
		color: var(--color-search-text);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}
	@media (prefers-reduced-motion: reduce) {
		.card:hover,
		.card:hover .card-figure img {
			transform: none;
		}
	}
</style>
