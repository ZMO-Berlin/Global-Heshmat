<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { aboutContent as about } from '$lib/data/about';
	import zmoLogo from '$lib/assets/logo-zmo-small.webp';

	const store = getBrowseStore();
</script>

<Modal open={store.aboutOpen} title={about.title} onclose={() => (store.aboutOpen = false)}>
	<p>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<strong>{@html about.intro}</strong><br />{about.subtitle}
	</p>

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<p>{@html about.context}</p>

	{#each about.paragraphs as paragraph, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p>{@html paragraph}</p>
	{/each}

	<p>
		More information:<br />
		<a href={about.publicationUrl} target="_blank" rel="noopener noreferrer external"
			>{about.publicationLabel}</a
		>
		{#each about.moreInfo as link (link.url)}
			<br />
			<a href={link.url} target="_blank" rel="noopener noreferrer external">{link.label}</a>
		{/each}
	</p>

	<h3>Videos</h3>
	<div class="videos">
		{#each about.videos as video (video.url)}
			<a href={video.url} target="_blank" rel="noopener noreferrer external"
				>&#9654; {video.label}</a
			>
		{/each}
	</div>

	<div class="impressum">
		<!-- The ZMO credit lives here on phones and tablets, where the tab bar
		     replaces the footer that carries it on desktop. -->
		<a
			class="zmo-logo"
			href={about.impressum.website}
			target="_blank"
			rel="noopener noreferrer external"
			><img
				src={zmoLogo}
				alt="Leibniz-Zentrum Moderner Orient (ZMO)"
				width="80"
				height="74"
				loading="lazy"
			/></a
		>
		<strong>Impressum</strong><br />
		Idea &amp; Research:
		<a href={about.impressum.ideaResearch.url} target="_blank" rel="noopener noreferrer external"
			>{about.impressum.ideaResearch.name}</a
		>, {about.impressum.ideaResearch.affiliation}<br />
		Configuration:<br />
		{#each about.impressum.configuration as person (person)}
			{person}<br />
		{/each}
		Development:
		<a href={about.impressum.development.url} target="_blank" rel="noopener noreferrer external"
			>{about.impressum.development.name}</a
		>, {about.impressum.development.affiliation}<br />
		With contributions from {about.impressum.contributions}<br />
		<a href={about.impressum.website} target="_blank" rel="noopener noreferrer external"
			>www.zmo.de</a
		><br /><br />
		{about.impressum.thanks}
	</div>
</Modal>

<style>
	.zmo-logo {
		display: block;
		width: fit-content;
		margin-bottom: var(--space-3);
	}
	.zmo-logo img {
		display: block;
	}
</style>
