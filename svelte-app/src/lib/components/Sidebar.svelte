<script lang="ts">
	import { ImageOff, X } from '@lucide/svelte';
	import Gallery from './Gallery.svelte';
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

	const artwork = $derived(store.selectedArtwork);
	const isSearch = $derived(artwork?.status === 'search');
	const tagClass = $derived(
		isSearch ? 'tag-search' : artwork?.movement ? 'tag-moved' : 'tag-located'
	);
	const tagText = $derived(isSearch ? 'To be found' : artwork?.movement ? 'Relocated' : 'Located');
	const images = $derived.by(() => {
		if (!artwork) return [];
		if (artwork.images && artwork.images.length > 0) return artwork.images;
		if (artwork.image) return [{ src: artwork.image, caption: artwork.imageCaption || '' }];
		return [];
	});

	function getVideoId(url: string): string | null {
		const match = url.match(/(?:v=|\/)([\w-]{11})/);
		return match ? match[1] : null;
	}

	function close() {
		store.selectedArtwork = null;
	}
</script>

<div class="sidebar" class:open={artwork !== null}>
	{#if artwork}
		<div class="sidebar-header">
			<h2>{artwork.name}</h2>
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
				<div class="sidebar-meta">
					<span class="tag {tagClass}">{tagText}</span>
					<span>{artwork.city}, {artwork.country}</span>
				</div>
				<div class="sidebar-address">{artwork.address}</div>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is from our own data files, not user input -->
				<div class="sidebar-desc">{@html artwork.desc}</div>

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
			</div>
		</div>
	{/if}
</div>
