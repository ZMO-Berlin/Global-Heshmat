const origin = 'https://heshmat.zmo.de';
async function read(path, type) {
	const response = await fetch(origin + path, {
		signal: AbortSignal.timeout(15000),
		redirect: 'error'
	});
	if (!response.ok || !response.headers.get('content-type')?.includes(type))
		throw new Error(`${path}: ${response.status}, unexpected content type`);
	return response.text();
}
for (const path of ['/collection/', '/artworks/the-hassan-heshmat-museum/', '/trails/']) {
	const html = await read(path, 'text/html');
	if (!html.includes(`rel="canonical" href="${origin}${path}"`))
		throw new Error(`Missing canonical URL: ${path}`);
	const asset = html.match(/(?:href|src)="([^" ]*_app\/immutable\/[^" ]+\.css)"/);
	if (!asset) throw new Error(`Missing stylesheet: ${path}`);
	if (asset) {
		const url = new URL(asset[1], origin + path);
		await read(url.pathname, 'text/css');
	}
}
const sitemap = await read('/sitemap.xml', 'xml');
if (!sitemap.includes(`${origin}/collection/`)) throw new Error('Sitemap missing collection');
await read('/sw.js', 'javascript');
const data = JSON.parse(await read('/collection.json', 'json'));
if (!data.records?.length || !data.build) throw new Error('Collection export is empty');
const response = await fetch('https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', {
	signal: AbortSignal.timeout(15000)
});
if (!response.ok || (await response.json()).version !== 8)
	throw new Error('Basemap style is unavailable or invalid');
console.log(
	'Live canonical pages, assets, collection export, sitemap, worker and basemap are available.'
);
