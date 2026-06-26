/**
 * Single source of truth for the site's deployed origin.
 *
 * Used to build absolute URLs for canonical tags, Open Graph metadata,
 * JSON-LD payloads, and the sitemap. The trailing slash is intentionally
 * omitted so paths can be appended directly: `${SITE_URL}/artworks/foo/`.
 */
export const SITE_URL = 'https://heshmat.zmo.de';

export const SITE_NAME = 'Global Heshmat';

export const SITE_TAGLINE = 'Following Hassan Heshmat around the world';

export const SITE_DESCRIPTION =
	'Interactive map tracing the public artworks of Egyptian sculptor Hassan Heshmat (1920–2006) across Egypt, Europe, and beyond. A project by ZMO Berlin.';

export const PUBLISHER = {
	name: 'Leibniz-Zentrum Moderner Orient (ZMO)',
	url: 'https://www.zmo.de'
} as const;

export const ARTIST = {
	name: 'Hassan Heshmat',
	birthDate: '1920',
	deathDate: '2006',
	nationality: 'Egyptian',
	jobTitle: 'Sculptor'
} as const;

/** Build a fully-qualified URL from a site-relative path. */
export function absoluteUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalized}`;
}

/** Canonical path for an artwork's detail page. */
export function artworkPath(slug: string): string {
	return `/artworks/${slug}/`;
}

/** Canonical path for a place-of-residence detail page. */
export function residencePath(slug: string): string {
	return `/residences/${slug}/`;
}
