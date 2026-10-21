<script lang="ts">
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import { resolve } from '$app/paths';
	import SiteNav from './SiteNav.svelte';

	let { onreset }: { onreset: () => void } = $props();
	const store = getBrowseStore();
</script>

<header class="header">
	<h1>
		<button
			disabled={!store.ready}
			class="wordmark-reset"
			onclick={onreset}
			aria-label="Reset world view"
		>
			<!-- Non-breaking space: Svelte collapses ordinary whitespace around the
		     span boundary, which would render "GlobalHeshmat". -->
			<span>Global&nbsp;Heshmat</span>
			<span class="header-subtitle">&mdash; Following Hassan Heshmat around the world</span>
		</button>
	</h1>
	<div class="header-right">
		<!-- The main menu: pills here on desktop, a bottom tab bar below 1024px.
		     Shared views retain the visitor's active filters. -->
		<SiteNav />
		<button
			disabled={!store.ready}
			class="header-btn about-button"
			onclick={() => (store.aboutOpen = true)}>About</button
		>
		<a class="header-btn header-btn-cta" href={resolve('/missing')}>
			<span class="cta-full">Help us find missing works</span>
			<!-- &nbsp; for the same reason as the wordmark: an ordinary leading space
			     inside the span is collapsed, rendering "Missingworks". -->
			<span class="cta-short">Missing<span class="works-label">&nbsp;works</span></span>
		</a>
	</div>
</header>

<style>
	@media (max-width: 360px) {
		.works-label {
			display: none;
		}
	}
	.wordmark-reset {
		font: inherit;
		color: var(--color-accent);
		background: none;
		border: 0;
		cursor: pointer;
		text-align: start;
		min-height: 44px;
	}
	a.header-btn {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.header-subtitle {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--weight-regular);
		font-size: 0.7em;
		letter-spacing: var(--tracking-wide);
		color: rgb(var(--color-header-text-rgb) / 0.65);
		margin-left: var(--space-1);
	}
	/* The subtitle only appears where it fits on one line beside the full menu
	   (measured: from about 1460px); wrapped, it overflows the header height. */
	@media (max-width: 1499px) {
		.header-subtitle {
			display: none;
		}
	}
	/* Touch screens wider than a phone (tablets, touch laptops) keep the desktop
	   header, with pills grown to a 44px target. */
	@media (pointer: coarse) and (min-width: 769px) {
		.header-btn {
			min-height: 44px;
		}
	}

	/* Top bar: wordmark, subtitle, the menu, About and the appeal. */
	/* ═══════════════════════════════════════════
	   Header
	   ═══════════════════════════════════════════ */
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-header);
		height: var(--header-height);
		background: var(--color-header-bg);
		color: var(--color-header-text);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-7);
		box-shadow:
			0 1px 0 rgb(var(--color-accent-rgb) / 0.15),
			var(--shadow-bar-dark);
	}

	.header h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-tight);
	}

	.header h1 .wordmark-reset > span:first-child {
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
		font-style: italic;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
	}

	.header-btn {
		min-height: 36px;
		background: transparent;
		border: 1px solid rgb(var(--color-header-text-rgb) / 0.2);
		color: var(--color-header-text);
		padding: 7px var(--space-4-5);
		border-radius: var(--radius-pill);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		white-space: nowrap;
		transition:
			background-color var(--duration-slow) var(--ease-out),
			border-color var(--duration-slow) var(--ease-out),
			color var(--duration-slow) var(--ease-out),
			opacity var(--duration-slow) var(--ease-out);
	}

	.header-btn:hover {
		background: rgb(var(--color-accent-rgb) / 0.15);
		border-color: var(--color-accent);
		color: var(--color-on-dark);
	}

	/* Call-to-action variant: filled accent, sentence-case so the longer
	   appeal label reads as an invitation rather than a nav control. */
	.header-btn-cta {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-on-dark);
		text-transform: none;
		letter-spacing: var(--tracking-wide);
	}

	.header-btn-cta:hover {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-on-dark);
		opacity: 0.9;
	}

	/* Short label only swaps in on narrow viewports (see responsive block). */
	.header-btn-cta .cta-short {
		display: none;
	}

	@media (max-width: 768px) {
		.header {
			padding: 0 var(--space-3-5);
		}

		/* With the menu in the tab bar, the full wordmark fits even at 320px. */
		.header h1 {
			font-size: var(--text-lg);
			white-space: nowrap;
			/* Absorb any remaining squeeze here instead of letting the button row
				   overflow the viewport. */
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.header-right {
			flex-shrink: 0;
			gap: var(--space-1-5);
		}

		.header-btn {
			min-width: 44px;
			height: 44px;
			padding: 6px var(--space-2-5);
			font-size: var(--text-xs);
			letter-spacing: normal;
		}

		/* Swap to the compact CTA label so it fits beside About on a phone. */
		.header-btn-cta .cta-full {
			display: none;
		}

		.header-btn-cta .cta-short {
			display: inline;
		}
	}
</style>
