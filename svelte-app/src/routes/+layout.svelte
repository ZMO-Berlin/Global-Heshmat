<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import logo from '$lib/assets/logo-zmo.png';
	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={logo} type="image/png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
