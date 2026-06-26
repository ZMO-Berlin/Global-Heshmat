<script lang="ts">
	import type { Artwork, Residence } from '$lib/data/types';
	import {
		SITE_URL,
		SITE_NAME,
		SITE_TAGLINE,
		SITE_DESCRIPTION,
		PUBLISHER,
		ARTIST,
		absoluteUrl,
		artworkPath,
		residencePath
	} from '$lib/config';

	interface Props {
		/** When provided, render artwork-specific metadata (title, OG, JSON-LD). */
		artwork?: Artwork | null;
		/** When provided, render residence-specific metadata. Otherwise site metadata. */
		residence?: Residence | null;
	}

	const { artwork = null, residence = null }: Props = $props();

	const OG_IMAGE = `${SITE_URL}/og-image.png`;

	const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');
	const truncate = (s: string, n: number) =>
		s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';

	// First photo of a residence — its `images` array takes precedence over the
	// legacy single `image`, mirroring the gallery's own resolution order.
	const residenceImage = $derived(residence?.images?.[0]?.src ?? residence?.image);

	const title = $derived(
		artwork
			? `${artwork.name} — ${SITE_NAME}`
			: residence
				? `${residence.name} — ${SITE_NAME}`
				: `${SITE_NAME} — ${SITE_TAGLINE}`
	);

	const description = $derived(
		artwork
			? truncate(
					`${artwork.name} — ${artwork.city}, ${artwork.country}. ${stripHtml(artwork.desc)}`,
					200
				)
			: residence
				? truncate(
						`${residence.name} — ${residence.city}, ${residence.country}. ${stripHtml(residence.desc)}`,
						200
					)
				: SITE_DESCRIPTION
	);

	const canonicalUrl = $derived(
		artwork
			? absoluteUrl(artworkPath(artwork.slug!))
			: residence
				? absoluteUrl(residencePath(residence.slug!))
				: `${SITE_URL}/`
	);

	const jsonLd = $derived(
		artwork
			? {
					'@context': 'https://schema.org',
					'@type': 'VisualArtwork',
					name: artwork.name,
					description: truncate(stripHtml(artwork.desc), 300),
					image: artwork.image ? absoluteUrl(`/images/${artwork.image}`) : undefined,
					url: canonicalUrl,
					locationCreated: {
						'@type': 'Place',
						name: `${artwork.city}, ${artwork.country}`,
						address: {
							'@type': 'PostalAddress',
							streetAddress: artwork.address,
							addressLocality: artwork.city,
							addressCountry: artwork.country
						},
						geo: {
							'@type': 'GeoCoordinates',
							latitude: artwork.lat,
							longitude: artwork.lng
						}
					},
					creator: {
						'@type': 'Person',
						name: ARTIST.name,
						birthDate: ARTIST.birthDate,
						deathDate: ARTIST.deathDate,
						nationality: ARTIST.nationality
					},
					isPartOf: {
						'@type': 'WebSite',
						name: SITE_NAME,
						url: SITE_URL
					}
				}
			: residence
				? {
						'@context': 'https://schema.org',
						'@type': 'Place',
						name: residence.name,
						description: truncate(stripHtml(residence.desc), 300),
						image: residenceImage ? absoluteUrl(`/images/${residenceImage}`) : undefined,
						url: canonicalUrl,
						address: {
							'@type': 'PostalAddress',
							addressLocality: residence.city,
							addressCountry: residence.country
						},
						geo: {
							'@type': 'GeoCoordinates',
							latitude: residence.lat,
							longitude: residence.lng
						},
						isPartOf: {
							'@type': 'WebSite',
							name: SITE_NAME,
							url: SITE_URL
						}
					}
				: {
						'@context': 'https://schema.org',
						'@type': 'WebSite',
						name: SITE_NAME,
						alternateName: SITE_TAGLINE,
						description: SITE_DESCRIPTION,
						url: SITE_URL,
						inLanguage: 'en',
						about: {
							'@type': 'Person',
							name: ARTIST.name,
							birthDate: ARTIST.birthDate,
							deathDate: ARTIST.deathDate,
							nationality: ARTIST.nationality,
							jobTitle: ARTIST.jobTitle
						},
						publisher: {
							'@type': 'Organization',
							name: PUBLISHER.name,
							url: PUBLISHER.url
						}
					}
	);

	const ogType = $derived(artwork || residence ? 'article' : 'website');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:site_name" content={SITE_NAME} />
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

	<!-- JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</' + 'script>'}
</svelte:head>
