<script lang="ts">
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
			<button class="sidebar-close" onclick={close} aria-label="Close">&times;</button>
		</div>
		<div class="sidebar-body">
			{#if images.length > 0}
				<Gallery {images} />
			{:else}
				<div class="sidebar-image">
					<div class="sidebar-image-placeholder">
						<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect
								x="8"
								y="16"
								width="48"
								height="36"
								rx="3"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
							/>
							<circle cx="22" cy="30" r="5" stroke="currentColor" stroke-width="2" />
							<path
								d="M8 44l14-10 8 6 12-10 14 10"
								stroke="currentColor"
								stroke-width="2"
								fill="none"
								stroke-linejoin="round"
							/>
							<path
								d="M28 8l4-4 4 4"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<line x1="32" y1="4" x2="32" y2="16" stroke="currentColor" stroke-width="2" />
						</svg>
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
