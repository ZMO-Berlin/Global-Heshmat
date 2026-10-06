<script lang="ts">
	import { plainText } from '$lib/utils/text';
	import type { IndexedArtwork, IndexedResidence } from '$lib/data/types';
	import { entryStructuredData } from '$lib/utils/structured-data';
	import { webUrl, leadImage } from '$lib/utils/image';
	import {
		SITE_URL,
		SITE_NAME,
		SITE_TAGLINE,
		SITE_DESCRIPTION,
		PUBLISHER,
		ARTIST,
		absoluteUrl
	} from '$lib/config';
	import { entryPath } from '$lib/utils/collection';

	interface Props {
		/** When provided, render artwork-specific metadata (title, OG, JSON-LD). */
		artwork?: IndexedArtwork | null;
		/** When provided, render residence-specific metadata. Otherwise site metadata. */
		residence?: IndexedResidence | null;
		/**
		 * Overrides for an ordinary content page (the collection grid), which is
		 * neither an artwork nor a residence but still wants its own title,
		 * description and canonical URL rather than the site defaults.
		 */
		title?: string;
		description?: string;
		/** Site-relative path used for the canonical URL, e.g. "/collection/". */
		path?: string;
	}

	const {
		artwork = null,
		residence = null,
		title: titleOverride,
		description: descriptionOverride,
		path
	}: Props = $props();

	const OG_IMAGE = $derived(
		(artwork && leadImage(artwork)) || (residence && leadImage(residence))
			? absoluteUrl(webUrl(leadImage(artwork ?? residence!)!))
			: `${SITE_URL}/og-image.png`
	);

	const truncate = (s: string, n: number) =>
		s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';

	const title = $derived(
		titleOverride
			? titleOverride
			: artwork
				? `${artwork.name} — ${SITE_NAME}`
				: residence
					? `${residence.name} — ${SITE_NAME}`
					: `${SITE_NAME} — ${SITE_TAGLINE}`
	);

	const description = $derived(
		descriptionOverride
			? descriptionOverride
			: artwork
				? truncate(
						`${artwork.name} — ${artwork.city}, ${artwork.country}. ${plainText(artwork.desc)}`,
						200
					)
				: residence
					? truncate(
							`${residence.name} — ${residence.city}, ${residence.country}. ${plainText(residence.desc)}`,
							200
						)
					: SITE_DESCRIPTION
	);

	const canonicalUrl = $derived(
		path
			? absoluteUrl(path)
			: (artwork ?? residence)
				? absoluteUrl(entryPath((artwork ?? residence)!))
				: `${SITE_URL}/`
	);

	const jsonLd = $derived(
		(artwork ?? residence)
			? entryStructuredData((artwork ?? residence)!)
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

	<!-- JSON-LD structured data. `<` is escaped so no data string (names and
	     descriptions are curated but free-form) can ever close the script tag
	     or open another element mid-payload. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' +
		JSON.stringify(jsonLd).replace(/</g, '\\u003c') +
		'</' +
		'script>'}
</svelte:head>
