<script lang="ts">
	import { videoUrl } from '$lib/utils/video';

	// Self-hosted clip played inline with the browser's native controls. Kept
	// deliberately small and orientation-agnostic: the CSS caps the height so a
	// portrait (9:16 phone) clip doesn't dominate the sidebar, and the browser
	// preserves the source's intrinsic aspect ratio.
	let { src, caption }: { src: string; caption?: string } = $props();
</script>

<figure class="video-player">
	<video controls preload="metadata" playsinline>
		<source src={videoUrl(src)} type="video/mp4" />
		<!-- Fallback, shown only if the browser can't render <video> at all. The
		     download link points at a static asset under /videos (the site deploys
		     at the domain root), not a SvelteKit route, so resolve() doesn't apply. -->
		<p>
			Your browser can’t play this video.
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={videoUrl(src)} download>Download it instead</a>.
		</p>
	</video>
	{#if caption}
		<figcaption dir="auto">{caption}</figcaption>
	{/if}
</figure>

<style>
	/* Self-hosted clip player. */
	.video-player {
		margin: var(--space-4-5) 0;
		text-align: center;
	}

	.video-player video {
		max-width: 100%;
		/* Cap the height so a portrait (9:16 phone) clip doesn't dominate the narrow
		   sidebar; the browser preserves the clip's intrinsic aspect ratio within
		   the max-width / max-height box. */
		max-height: 60vh;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: #000;
	}

	.video-player figcaption {
		margin-top: var(--space-2-5);
		font-size: var(--text-xs);
		font-style: italic;
		color: var(--color-text-muted);
	}
</style>
