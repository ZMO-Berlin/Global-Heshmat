<script lang="ts">
	import { X } from '@lucide/svelte';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { aboutContent as about } from '$lib/data/about';

	const store = getMapStore();

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) store.aboutOpen = false;
	}
</script>

{#if store.aboutOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="about-overlay" onclick={handleOverlayClick}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="about-modal" onclick={(e) => e.stopPropagation()}>
			<div class="about-header">
				<h2>{about.title}</h2>
				<button class="sidebar-close" onclick={() => (store.aboutOpen = false)} aria-label="Close">
					<X size={20} strokeWidth={2.25} />
				</button>
			</div>
			<div class="about-body">
				<p>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<strong>{@html about.intro}</strong><br />{about.subtitle}
				</p>

				{#each about.paragraphs as paragraph (paragraph.slice(0, 30))}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html paragraph}</p>
				{/each}

				<p>
					More information:
					<a href={about.publicationUrl} target="_blank" rel="noopener noreferrer external"
						>{about.publicationLabel}</a
					>
				</p>

				<h3>Videos</h3>
				<div class="videos">
					{#each about.videos as video (video.url)}
						<a href={video.url} target="_blank" rel="noopener noreferrer external"
							>&#9654; {video.label}</a
						>
					{/each}
				</div>

				<h3>Help us find missing works</h3>
				<p>
					{about.missingWorksText}
					<a href="mailto:{about.contactEmail}">{about.contactEmail}</a>
				</p>

				<div class="impressum">
					<strong>Impressum</strong><br />
					Concept: {about.impressum.concept}<br />
					Content: {about.impressum.content}<br />
					Development:
					<a
						href={about.impressum.development.url}
						target="_blank"
						rel="noopener noreferrer external">{about.impressum.development.name}</a
					>, {about.impressum.development.affiliation}<br />
					<a href={about.impressum.website} target="_blank" rel="noopener noreferrer external"
						>www.zmo.de</a
					><br /><br />
					{about.impressum.thanks}
				</div>
			</div>
		</div>
	</div>
{/if}
