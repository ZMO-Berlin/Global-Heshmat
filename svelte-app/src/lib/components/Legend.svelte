<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	// Collapsible so it can be folded away on a phone, where five rows plus the
	// footer eat most of an already short map. Open by default; the user's
	// choice then sticks for the session.
	let open = $state(true);
	const titleId = $props.id();
</script>

<aside class="legend" class:collapsed={!open} aria-labelledby={titleId}>
	<button class="legend-toggle" aria-expanded={open} onclick={() => (open = !open)}>
		<!-- Was an <h4> directly under the page <h1>, skipping two levels. -->
		<h2 id={titleId}>Legend</h2>
		<ChevronDown class="legend-chevron" size={15} strokeWidth={2.5} aria-hidden="true" />
	</button>
	{#if open}
		<div class="legend-items">
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-primary);"></div>
				Located artwork
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-search);"></div>
				To be found
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-residence);"></div>
				Places of residence
			</div>
			<div class="legend-item">
				<div class="legend-dot ghost-dot"></div>
				Former location
			</div>
			<div class="legend-item">
				<div class="legend-line"></div>
				Relocation path
			</div>
		</div>
	{/if}
</aside>

<style>
	.ghost-dot {
		background: transparent !important;
		border: 2px dashed var(--color-text-muted) !important;
		box-shadow: none !important;
	}

	/* The toggle wraps the title so the whole strip is the hit target. Plain
	   button reset — the legend box itself supplies the chrome. */
	.legend-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-5);
		width: 100%;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		color: inherit;
		text-align: left;
	}
	.legend-toggle :global(.legend-chevron) {
		flex-shrink: 0;
		color: var(--color-text-muted);
		transition: transform var(--duration-base) var(--ease-out);
	}
	.collapsed .legend-toggle :global(.legend-chevron) {
		transform: rotate(-90deg);
	}

	/* Map legend box. */
	/* ═══════════════════════════════════════════
	   Legend
	   ═══════════════════════════════════════════ */
	.legend {
		position: fixed;
		bottom: calc(var(--footer-height) + 20px);
		left: 28px;
		z-index: var(--z-legend);
		background: var(--color-surface);
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		font-size: var(--text-sm);
		border-top: 2px solid var(--color-accent);
	}

	.legend h2 {
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		color: var(--color-text-secondary);
		letter-spacing: var(--tracking-wide);
	}

	/* The items block carries the gap to the title, so a collapsed legend
	   shrinks to just its heading row. */
	.legend-items {
		margin-top: var(--space-2-5);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		margin: var(--space-1-5) 0;
		color: var(--color-text-secondary);
	}

	.legend-dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 0 0 1px var(--color-border);
		flex-shrink: 0;
	}

	.legend-line {
		width: 24px;
		height: 0;
		border-top: 2px dashed var(--color-accent);
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.legend {
			bottom: calc(var(--footer-height) + 14px);
			left: 14px;
			padding: var(--space-3) var(--space-4);
			font-size: var(--text-sm);
		}
	}
</style>
