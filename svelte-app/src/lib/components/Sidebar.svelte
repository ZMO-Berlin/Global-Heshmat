<script lang="ts">
	import { ImageOff, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Gallery from './Gallery.svelte';
	import { getMapStore } from '$lib/stores/map.svelte';

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

	function getVideoId(url: string): string | null {
		const match = url.match(/(?:v=|\/)([\w-]{11})/);
		return match ? match[1] : null;
	}

	function close() {
		if (artwork) {
			// Artworks own a route — navigate home so the URL and the sidebar
			// both clear (the home page resets the store selection on mount).
			goto(resolve('/'));
		} else {
			// Residences are sidebar-only (no route), so just drop the selection.
			store.selectedResidence = null;
		}
	}
</script>

<div class="sidebar" class:open={item !== null}>
	{#if item}
		<div class="sidebar-header">
			<h2 dir="auto">{item.name}</h2>
			<button class="sidebar-close" onclick={close} aria-label="Close">
				<X size={20} strokeWidth={2.25} />
			</button>
		</div>
		<div class="sidebar-body">
			{#if images.length > 0}
				<Gallery {images} />
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
						{@const videoId = getVideoId(artwork.video)}
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
							<a href="mailto:sonja.hegasy@zmo.de">sonja.hegasy@zmo.de</a>
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
</div>
