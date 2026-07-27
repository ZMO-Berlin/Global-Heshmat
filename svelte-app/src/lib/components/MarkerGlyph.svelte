<script lang="ts">
	import { MARKER_SPECS, type MarkerKind } from '$lib/utils/marker-icons';

	/**
	 * The SVG twin of the shapes MapView paints onto the map canvas. Both read
	 * MARKER_SPECS, so the legend and the collection list cannot drift from the
	 * markers they describe.
	 *
	 * Decorative by default: these always sit beside their own text label, so
	 * announcing them again would just be noise. Pass `label` to give the glyph
	 * an accessible name where it stands alone.
	 */
	let { kind, size = 12, label }: { kind: MarkerKind; size?: number; label?: string } = $props();

	const spec = $derived(MARKER_SPECS[kind]);
	const color = $derived(`var(${spec.colorToken})`);
	// Drawn in a 24-unit box to match MARKER_BOX, then scaled by the viewBox.
	const C = 12;
</script>

<svg
	class="glyph"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	role={label ? 'img' : 'presentation'}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#if spec.shape === 'disc'}
		<circle cx={C} cy={C} r="9" fill={color} />
	{:else if spec.shape === 'ring'}
		<circle cx={C} cy={C} r="8" fill="none" stroke={color} stroke-width="4" />
		<circle cx={C} cy={C} r="2.8" fill={color} />
	{:else if spec.shape === 'diamond'}
		<path d="M12 2 L22 12 L12 22 L2 12 Z" fill={color} />
	{:else if spec.shape === 'dashed-ring'}
		<circle
			cx={C}
			cy={C}
			r="8.5"
			fill="none"
			stroke={color}
			stroke-width="3"
			stroke-dasharray="4 3.4"
		/>
	{/if}
</svg>

<style>
	.glyph {
		flex-shrink: 0;
		display: block;
		overflow: visible;
	}
</style>
