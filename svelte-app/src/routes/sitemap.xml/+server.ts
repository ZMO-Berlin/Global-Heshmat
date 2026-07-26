import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { SITE_URL, artworkPath, residencePath } from '$lib/config';
import { escapeXml } from '$lib/utils/xml';

// Prerender so the file is written once at build time and served as a
// static asset, not regenerated per request.
export const prerender = true;

interface SitemapEntry {
	loc: string;
	changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority: string;
}

export function GET(): Response {
	const entries: SitemapEntry[] = [
		{ loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
		{ loc: `${SITE_URL}/collection/`, changefreq: 'weekly', priority: '0.9' },
		...artworks.map((a) => ({
			loc: `${SITE_URL}${artworkPath(a.slug)}`,
			changefreq: 'monthly' as const,
			priority: '0.8'
		})),
		...residences.map((r) => ({
			loc: `${SITE_URL}${residencePath(r.slug)}`,
			changefreq: 'monthly' as const,
			priority: '0.7'
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

	// No Cache-Control: the route is prerendered to a static file, so the
	// hosting platform's own headers are what actually reach clients.
	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
}
