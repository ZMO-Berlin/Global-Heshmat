<script lang="ts">
	import { getMapStore } from '$lib/stores/map.svelte';

	const store = getMapStore();

	const BASE_TITLE = 'Global Heshmat — Following Hassan Heshmat around the world';
	const BASE_DESCRIPTION =
		'Interactive map tracing the public artworks of Egyptian sculptor Hassan Heshmat (1920–2006) across Egypt, Europe, and beyond. A project by ZMO Berlin.';
	const SITE_URL = 'https://zmo-berlin.github.io/Global-Heshmat';
	const OG_IMAGE = `${SITE_URL}/og-image.png`;

	const title = $derived(
		store.selectedArtwork
			? `${store.selectedArtwork.name} — Global Heshmat`
			: BASE_TITLE
	);

	const description = $derived(
		store.selectedArtwork
			? `${store.selectedArtwork.name} — ${store.selectedArtwork.city}, ${store.selectedArtwork.country}. ${store.selectedArtwork.desc.replace(/<[^>]*>/g, '').slice(0, 160)}…`
			: BASE_DESCRIPTION
	);

	const canonicalUrl = $derived(
		store.selectedArtwork
			? `${SITE_URL}?artwork=${store.selectedArtwork.id}`
			: SITE_URL
	);

	// JSON-LD structured data
	const jsonLd = $derived(
		store.selectedArtwork
			? JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'VisualArtwork',
					name: store.selectedArtwork.name,
					description: store.selectedArtwork.desc.replace(/<[^>]*>/g, '').slice(0, 300),
					locationCreated: {
						'@type': 'Place',
						name: `${store.selectedArtwork.city}, ${store.selectedArtwork.country}`,
						geo: {
							'@type': 'GeoCoordinates',
							latitude: store.selectedArtwork.lat,
							longitude: store.selectedArtwork.lng
						}
					},
					creator: {
						'@type': 'Person',
						name: 'Hassan Heshmat',
						birthDate: '1920',
						deathDate: '2006',
						nationality: 'Egyptian'
					},
					isPartOf: {
						'@type': 'WebApplication',
						name: 'Global Heshmat',
						url: SITE_URL
					}
				})
			: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: 'Global Heshmat',
					description: BASE_DESCRIPTION,
					url: SITE_URL,
					applicationCategory: 'EducationalApplication',
					about: {
						'@type': 'Person',
						name: 'Hassan Heshmat',
						birthDate: '1920',
						deathDate: '2006',
						nationality: 'Egyptian',
						jobTitle: 'Sculptor'
					},
					publisher: {
						'@type': 'Organization',
						name: 'Leibniz-Zentrum Moderner Orient (ZMO)',
						url: 'https://www.zmo.de'
					}
				})
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:site_name" content="Global Heshmat" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={OG_IMAGE} />

	<!-- Additional meta -->
	<meta name="author" content="ZMO Berlin" />
	<meta
		name="keywords"
		content="Hassan Heshmat, Egyptian sculptor, public art, sculpture map, ZMO, art history, Egypt, ceramics, porcelain"
	/>
	<meta name="robots" content="index, follow" />
	<meta name="theme-color" content="#16192e" />

	<!-- JSON-LD Structured Data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + jsonLd + '</' + 'script>'}
</svelte:head>
