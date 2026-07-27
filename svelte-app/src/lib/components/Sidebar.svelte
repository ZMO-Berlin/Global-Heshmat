<script lang="ts">
	import { ImageOff, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Gallery from './Gallery.svelte';
	import VideoPlayer from './VideoPlayer.svelte';
	import { aboutContent as about } from '$lib/data/about';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { youTubeId } from '$lib/utils/video';

	const store = getMapStore();

	// The sidebar shows either an artwork or a place of residence (never both —
	// the store enforces that). The header (name) and image gallery are shared;
	// only the body details differ between the two.
	const artwork = $derived(store.selectedArtwork);
	const residence = $derived(store.selectedResidence);
	const item = $derived(artwork ?? residence);

	const isSearch = $derived(artwork?.status === 'search');
	const tagClass = $derived(
		isSearch ? 'tag-search' : artwork?.movement ? 'tag-moved' : 'tag-located'
	);
	const tagText = $derived(isSearch ? 'To be found' : artwork?.movement ? 'Relocated' : 'Located');
	const images = $derived.by(() => {
		if (!item) return [];
		if (item.images && item.images.length > 0) return item.images;
		if (item.image) return [{ src: item.image, caption: item.imageCaption || '' }];
		return [];
	});

	// Focus the panel heading when an item opens. Both routes into the sidebar
	// unmount whatever the user was on — a search result unmounts the input
	// they typed in, a collection-panel link unmounts the link itself — and
	// SvelteKit then resets focus to <body>, stranding a keyboard user at the
	// top of the document while the panel they opened sits below.
	//
	// Deferred to the next frame precisely because of that reset: focusing
	// synchronously in the effect happens first and gets overwritten.
	let headingEl: HTMLElement | undefined = $state();
	let lastId: number | null = null;

	$effect(() => {
		if (!item) {
			lastId = null;
			return;
		}
		if (item.id === lastId) return;
		lastId = item.id;
		// No cleanup that cancels this frame: the effect re-runs when the store
		// settles, and cancelling on re-run would kill the pending focus before
		// it ever fired.
		requestAnimationFrame(() => headingEl?.focus());
	});

	function close() {
		// Artworks and residences both own a route, so navigating home clears
		// the URL and the sidebar (the home page resets the selection on mount).
		goto(resolve('/'));
	}
</script>

<aside
	class="sidebar"
	class:open={item !== null}
	aria-label={item ? `Details: ${item.name}` : 'Details'}
	inert={item === null}
>
	{#if item}
		<div class="sidebar-header">
			<h2 dir="auto" tabindex="-1" bind:this={headingEl}>{item.name}</h2>
			<button class="btn-close" onclick={close} aria-label="Close">
				<X size={20} strokeWidth={2.25} />
			</button>
		</div>
		<div class="sidebar-body">
			{#if images.length > 0}
				<!-- Keyed so switching items rebuilds the gallery from image 0
				     instead of reusing the instance (whose index could point
				     past the end of a shorter image list). -->
				{#key item.id}
					<Gallery {images} name={item.name} />
				{/key}
			{:else}
				<div class="sidebar-image">
					<div class="sidebar-image-placeholder">
						<ImageOff size={44} strokeWidth={1.75} />
						<span>Image coming soon</span>
					</div>
				</div>
			{/if}

			<div class="sidebar-content">
				{#if artwork}
					<div class="sidebar-meta">
						<span class="tag {tagClass}">{tagText}</span>
						<span dir="auto">{artwork.city}, {artwork.country}</span>
					</div>
					<div class="sidebar-address" dir="auto">{artwork.address}</div>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is from our own data files, not user input -->
					<div class="sidebar-desc" dir="auto">{@html artwork.desc}</div>

					{#if artwork.movement}
						<div class="sidebar-movement">
							<strong>Relocated {artwork.movement.year}</strong><br />
							From: {artwork.movement.fromName}<br />
							To: {artwork.city}
						</div>
					{/if}

					{#if artwork.video}
						{@const videoId = youTubeId(artwork.video)}
						{#if videoId}
							<div class="sidebar-video">
								<iframe
									src="https://www.youtube.com/embed/{videoId}"
									allowfullscreen
									loading="lazy"
									title="Video"
								></iframe>
							</div>
						{/if}
					{/if}

					{#if artwork.videoFile}
						<VideoPlayer src={artwork.videoFile} caption={artwork.videoCaption} />
					{/if}

					{#if artwork.links && artwork.links.length > 0}
						<div class="sidebar-links">
							{#each artwork.links as link (link.url)}
								<a href={link.url} target="_blank" rel="noopener noreferrer external"
									>{link.label} &rarr;</a
								>
							{/each}
						</div>
					{/if}

					{#if isSearch}
						<div class="sidebar-contact">
							Do you know where this artwork is? Please contact
							<a href="mailto:{about.contactEmail}">{about.contactEmail}</a>
						</div>
					{/if}
				{:else if residence}
					<div class="sidebar-meta">
						<span class="tag tag-residence">Place of residence</span>
						<span dir="auto">{residence.city}, {residence.country}</span>
					</div>
					{#if residence.years}
						<div class="sidebar-address" dir="auto">{residence.years}</div>
					{/if}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is from our own data files, not user input -->
					<div class="sidebar-desc" dir="auto">{@html residence.desc}</div>
				{/if}
			</div>
		</div>
	{/if}
</aside>

<style>
	/* Detail panel for the selected artwork or place of residence.
	   Rules reaching into .sidebar-desc are :global() because that block holds
	   {@html} from the data files, which Svelte's scoping class never touches. */
	/* ═══════════════════════════════════════════
	   Sidebar
	   ═══════════════════════════════════════════ */
	.sidebar {
		position: fixed;
		top: calc(var(--header-height) + var(--filter-height));
		right: 0;
		bottom: var(--footer-height);
		width: var(--sidebar-width);
		background: var(--color-surface);
		z-index: var(--z-sidebar);
		transform: translateX(100%);
		transition: transform var(--duration-slower) var(--ease-out);
		box-shadow: var(--shadow-sidebar);
		display: flex;
		flex-direction: column;
	}

	.sidebar.open {
		transform: translateX(0);
	}

	.sidebar-header {
		padding: var(--space-5-5) var(--space-7) var(--space-4-5);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-shrink: 0;
	}

	/* Editorial accent rule under the title — a small museum-catalogue flourish
	   that visually anchors the article that follows. */
	.sidebar-header h2 {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		line-height: var(--leading-tight);
		flex: 1;
		padding-right: var(--space-3-5);
	}

	.sidebar-header h2::after {
		content: '';
		display: block;
		width: 36px;
		height: 2px;
		background: var(--color-accent);
		margin-top: var(--space-2);
		border-radius: 1px;
	}

	.sidebar-body {
		padding: 0 0 var(--space-7);
		overflow-y: auto;
		flex: 1;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.sidebar-image {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--color-surface-image);
		position: relative;
	}

	.sidebar-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-text-placeholder);
	}

	/* The icon is a Lucide component, so its <svg> is compiled in that
	   component's scope, not ours — the selector must be :global(). */
	.sidebar-image-placeholder :global(svg) {
		width: 44px;
		height: 44px;
		margin-bottom: var(--space-2-5);
		opacity: 0.75;
	}

	.sidebar-image-placeholder span {
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-style: italic;
	}

	.sidebar-content {
		padding: var(--space-5-5) var(--space-7);
	}

	.sidebar-meta {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		margin-bottom: var(--space-4-5);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.sidebar-meta .tag {
		padding: 3px var(--space-2-5);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}

	.tag-located {
		background: var(--color-primary-light);
		color: var(--color-primary-text);
	}

	.tag-search {
		background: var(--color-search-light);
		color: var(--color-search-text);
	}

	.tag-moved {
		background: var(--color-moved-light);
		color: var(--color-moved-text);
	}

	/* No handpicked --color-residence-light exists, so derive a soft tint from the
	   residence rgb triplet (same approach as --color-accent-light). */
	.tag-residence {
		background: rgb(var(--color-residence-rgb) / 0.12);
		color: var(--color-residence);
	}

	.sidebar-desc {
		font-size: var(--text-md);
		line-height: var(--leading-prose);
		color: var(--color-text);
		margin-bottom: var(--space-5-5);
	}

	.sidebar-desc :global(a) {
		color: var(--color-primary-text);
		text-decoration-color: rgb(var(--color-primary-rgb) / 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color var(--duration-fast) var(--ease-out);
	}

	.sidebar-desc :global(a:hover) {
		text-decoration-color: var(--color-primary-text);
	}

	.sidebar-address {
		font-family: var(--font-display);
		font-size: var(--text-md);
		color: var(--color-text-muted);
		margin-bottom: var(--space-4-5);
		font-style: italic;
		line-height: var(--leading-normal);
	}

	.sidebar-video {
		margin: var(--space-4-5) 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.sidebar-video iframe {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
	}

	.sidebar-links {
		margin-top: var(--space-4-5);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
	}

	.sidebar-links a {
		display: inline-block;
		padding: var(--space-1-5) var(--space-3-5);
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-ink);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		transition: all var(--duration-base) var(--ease-out);
	}

	.sidebar-links a:hover {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent-text);
	}

	.sidebar-movement {
		margin: var(--space-4-5) 0;
		padding: var(--space-3-5) var(--space-4-5);
		background: var(--color-moved-light);
		border-left: 3px solid var(--color-moved);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
	}

	.sidebar-contact {
		margin-top: var(--space-5-5);
		padding: var(--space-3-5) var(--space-4-5);
		background: var(--color-search-light);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		border: 1px solid rgb(var(--color-search-rgb) / 0.15);
	}

	.sidebar-contact a {
		color: var(--color-primary-text);
		font-weight: var(--weight-medium);
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
		}
	}
</style>
