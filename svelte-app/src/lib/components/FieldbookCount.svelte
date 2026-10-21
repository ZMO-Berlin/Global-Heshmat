<script lang="ts">
	import { getFieldbook } from '$lib/stores/fieldbook.svelte';
	const fieldbook = getFieldbook();
	const count = $derived(fieldbook.keys.length);
</script>

<!-- Placed by SiteNav: after the label in the header menu, on the icon's
     corner in the tab bar. Re-keyed on each addition so the acknowledgement
     replays; a restore from storage leaves `pulse` at 0, so page loads stay
     still. The number is read out through the link's accessible name. -->
{#if count}{#key fieldbook.pulse}<span
			class="count"
			class:bump={fieldbook.pulse > 0}
			aria-hidden="true">{count > 99 ? '99+' : count}</span
		>{/key}{/if}

<style>
	.count {
		display: inline-grid;
		place-items: center;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: var(--radius-pill);
		background: var(--color-accent);
		color: var(--color-ink);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: var(--weight-bold);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
		line-height: 1;
	}
	.bump {
		animation: bump 520ms var(--ease-out);
	}
	@keyframes bump {
		0% {
			transform: scale(1);
		}
		30% {
			transform: scale(1.45);
		}
		100% {
			transform: scale(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.bump {
			animation: none;
		}
	}
</style>
