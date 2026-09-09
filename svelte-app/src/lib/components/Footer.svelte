<script lang="ts">
	import { aboutContent as about } from '$lib/data/about';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import logo from '$lib/assets/logo-zmo-white-small.webp';
	const store = getBrowseStore();
</script>

<footer class="site-footer">
	<a
		href={about.impressum.website}
		target="_blank"
		rel="noopener noreferrer external"
		aria-label="Zentrum Moderner Orient"
		><img src={logo} alt="ZMO" width="30" height="30" /><span>Leibniz-Zentrum Moderner Orient</span
		></a
	><button disabled={!store.ready} onclick={() => (store.aboutOpen = true)}
		>About &amp; credits</button
	>
</footer>

<style>
	.site-footer {
		position: fixed;
		inset: auto 0 0;
		height: var(--footer-height);
		z-index: var(--z-footer);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: 0 var(--space-5);
		background: var(--color-header-bg);
		color: var(--color-header-text);
	}
	a {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-sm);
		color: inherit;
		text-decoration: none;
		min-height: 44px;
	}
	img {
		object-fit: contain;
	}
	button {
		min-height: 44px;
		padding: var(--space-2);
		border: 0;
		font: inherit;
		font-size: var(--text-sm);
		color: inherit;
		background: none;
		cursor: pointer;
	}
	@media (max-width: 600px) {
		.site-footer {
			padding: 0 var(--space-3);
		}
		a span {
			display: none;
		}
	}
</style>
