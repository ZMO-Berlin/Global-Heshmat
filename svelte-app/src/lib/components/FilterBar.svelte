<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { artworks, countries } from '$lib/data/artworks';
	import type { Artwork } from '$lib/data/types';
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

	let searchInput = $state('');
	let searchOpen = $state(false);

	const matches = $derived.by(() => {
		const q = searchInput.trim().toLowerCase();
		if (q.length < 2) return [];
		const words = q.split(/\s+/);
		return artworks
			.filter((a) => {
				const searchable = `${a.name} ${a.city} ${a.country} ${a.address}`.toLowerCase();
				return words.every((w) => searchable.includes(w));
			})
			.slice(0, 8);
	});

	function setFilter(filter: string) {
		store.activeFilter = filter;
		store.selectedArtwork = null;
	}

	function selectResult(artwork: Artwork) {
		searchInput = '';
		searchOpen = false;
		store.selectedArtwork = artwork;
	}

	function handleSearchFocus() {
		if (searchInput.trim().length >= 2) searchOpen = true;
	}
</script>

<svelte:window
	onclick={(e) => {
		if (!(e.target as HTMLElement)?.closest('.search-wrapper')) {
			searchOpen = false;
		}
	}}
/>

<div class="filters">
	<div class="filter-chips">
		<span>Filter:</span>

		<button
			class="filter-chip"
			class:active={store.activeFilter === 'all'}
			onclick={() => setFilter('all')}
		>
			All
		</button>

		<div class="filter-sep"></div>

		{#each countries as country (country)}
			<button
				class="filter-chip"
				class:active={store.activeFilter === country}
				onclick={() => setFilter(country)}
			>
				{country}
			</button>
		{/each}

		<div class="filter-sep"></div>

		<button
			class="filter-chip"
			class:active-search={store.activeFilter === 'search'}
			onclick={() => setFilter('search')}
		>
			To be found
		</button>

		<button
			class="filter-chip"
			class:active={store.activeFilter === 'residence'}
			onclick={() => setFilter('residence')}
		>
			Places of residence
		</button>
	</div>

	<div class="search-wrapper">
		<Search class="search-icon" size={14} strokeWidth={2.5} />
		<input
			type="text"
			class="search-input"
			placeholder="Search artworks..."
			bind:value={searchInput}
			oninput={() => (searchOpen = searchInput.trim().length >= 2)}
			onfocus={handleSearchFocus}
		/>

		{#if searchOpen && searchInput.trim().length >= 2}
			<div class="search-results">
				{#if matches.length === 0}
					<div class="search-empty">No artworks found</div>
				{:else}
					{#each matches as a (a.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="search-item" onclick={() => selectResult(a)}>
							<div class="search-item-name">
								<span
									class="search-item-status"
									style="background:{a.status === 'search'
										? 'var(--color-search)'
										: 'var(--color-primary)'}"
								></span>
								{a.name}
							</div>
							<div class="search-item-loc">{a.city}, {a.country}</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
