import { artworks } from '$lib/data/artworks';
import { SITE_URL, artworkPath } from '$lib/config';

// Prerender so the file is written once at build time and served as a
// static asset, not regenerated per request.
export const prerender = true;

const escapeXml = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

interface SitemapEntry {
	loc: string;
	changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority: string;
}

export function GET(): Response {
	const entries: SitemapEntry[] = [
		{ loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
		...artworks.map((a) => ({
			loc: `${SITE_URL}${artworkPath(a.slug!)}`,
			changefreq: 'monthly' as const,
			priority: '0.8'
		}))
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		entries
			.map(
				(e) =>
					`  <url>\n` +
					`    <loc>${escapeXml(e.loc)}</loc>\n` +
					`    <changefreq>${e.changefreq}</changefreq>\n` +
					`    <priority>${e.priority}</priority>\n` +
					`  </url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
