<script lang="ts">
	import type { SourceReference } from '#lib/data/types.js';
	let { source }: { source: Pick<SourceReference, 'label' | 'url'> } = $props();
</script>

{#if source.url}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a
	>{:else}{source.label}{/if}
