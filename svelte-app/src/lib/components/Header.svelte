<script lang="ts">
	import { getMapStore } from '$lib/stores/map.svelte';
	import ViewSwitcher from './ViewSwitcher.svelte';

	let { onreset }: { onreset: () => void } = $props();
	const store = getMapStore();
</script>

<header class="header">
	<h1>
		<!-- Non-breaking space: Svelte collapses ordinary whitespace around the
		     span boundary, which would render "GlobalHeshmat". Keeping it inside
		     the hidden span also removes it along with the word on narrow
		     viewports. -->
		<span><span class="wordmark-global">Global&nbsp;</span>Heshmat</span>
		<span class="header-subtitle">&mdash; Following Hassan Heshmat around the world</span>
	</h1>
	<div class="header-right">
		<!-- Map / Grid / List. This leads the row because the list is the
		     keyboard and screen-reader route into the works. The map segment
		     doubles as the old World View control via `onreset`. -->
		<ViewSwitcher variant="header" {onreset} />
		<button class="header-btn" onclick={() => (store.aboutOpen = true)}>About</button>
		<button class="header-btn header-btn-cta" onclick={() => (store.missingOpen = true)}>
			<span class="cta-full">Help us find missing works</span>
			<span class="cta-short">Missing works</span>
		</button>
	</div>
</header>

<style>
	.header-subtitle {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--weight-regular);
		font-size: 0.7em;
		letter-spacing: var(--tracking-wide);
		color: rgb(var(--color-header-text-rgb) / 0.65);
		margin-left: var(--space-1);
	}
	@media (max-width: 768px) {
		.header-subtitle {
			display: none;
		}
	}
	/* Below ~400px even the short labels overflow, so drop to the wordmark the
	   PWA manifest already uses as short_name. */
	@media (max-width: 400px) {
		.wordmark-global {
			display: none;
		}
	}

	/* Top bar: wordmark, subtitle, the view switcher and the two buttons. */
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

	.header h1 > span:first-child {
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

		.header h1 {
			font-size: var(--text-base);
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

		/* Swap to the compact CTA label so three buttons fit a phone header. */
		.header-btn-cta .cta-full {
			display: none;
		}

		.header-btn-cta .cta-short {
			display: inline;
		}
	}
</style>
