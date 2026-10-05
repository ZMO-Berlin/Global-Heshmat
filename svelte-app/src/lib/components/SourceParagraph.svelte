<script lang="ts">
	// Render source prose as text, allowing only literal http(s) links from the DOCX.
	/* eslint-disable svelte/no-navigation-without-resolve -- URLs here are external source citations. */
	let { text, referenceHref }: { text: string; referenceHref?: string } = $props();
	const parts = $derived(text.split(/(https?:\/\/[^\s)]+|see above)/g));
</script>

<p dir="auto">
	{#each parts as part, i (i)}{#if part === 'see above' && referenceHref}<a href={referenceHref}
				>{part}</a
			>{:else if /^https?:\/\//.test(part)}<a href={part} rel="external noreferrer">{part}</a
			>{:else}{part}{/if}{/each}
</p>

<style>
	p {
		overflow-wrap: anywhere;
		white-space: pre-line;
	}
</style>
