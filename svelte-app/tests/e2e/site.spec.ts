import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const corpus: { country: string; status?: string }[] = JSON.parse(
	readFileSync(new URL('../../build/collection.json', import.meta.url), 'utf8')
).records;
const missingCount = corpus.filter((item) => item.status === 'search').length;
const germanyCount = corpus.filter((item) => item.country === 'Germany').length;
const clientManifest: Record<string, { name: string; file: string }> = JSON.parse(
	readFileSync(
		new URL('../../.svelte-kit/output/client/.vite/manifest.json', import.meta.url),
		'utf8'
	)
);
const albumChunk = Object.values(clientManifest).find((asset) => asset.name === 'EntryDetail');
const museum = '/artworks/the-hassan-heshmat-museum/';
async function accessible(page: Page) {
	const result = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
		.analyze();
	expect(
		result.violations,
		JSON.stringify(
			result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))
		)
	).toEqual([]);
}

test('gallery is map-free, exposes albums and is accessible', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (req) => requests.push(req.url()));
	await page.goto('/collection/');
	await expect(page.locator('.card')).toHaveCount(corpus.length);
	await expect(page.locator('.photo-count').filter({ hasText: '17 photos' })).toBeVisible();
	await expect(page.locator('main .collection-page')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Entries', exact: true })).toBeEnabled();
	await expect(page.locator('canvas')).toHaveCount(0);
	expect(requests.some((url) => /maplibre|cartocdn/.test(url))).toBe(false);
	// Album controls belong to the entry routes, outside the collection's startup bundle.
	expect(albumChunk, 'EntryDetail must stay in a separate route chunk').toBeDefined();
	expect(requests.some((url) => new URL(url).pathname === '/' + albumChunk!.file)).toBe(false);
	await accessible(page);
});
test('filters combine and follow Gallery, List and browser history', async ({ page }) => {
	await page.goto('/collection/');
	await page.getByRole('combobox', { name: 'Country', exact: true }).selectOption('Egypt');
	await expect(page).toHaveURL(/country=Egypt/);
	await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('search');
	await expect(page).toHaveURL(/country=Egypt.*status=search/);
	const count = await page.locator('.card').count();
	expect(count).toBeGreaterThan(0);
	expect(count).toBeLessThan(missingCount);
	await expect(page.locator('.card-badge')).toHaveCount(count);
	await page.getByRole('link', { name: 'List view', exact: true }).click();
	await expect(page.locator('.entry-list li')).toHaveCount(count);
	await expect(page).toHaveURL(/mode=list/);
	await page.goBack();
	await expect(page.locator('.card')).toHaveCount(count);
	await page.reload();
	await expect(page.locator('.card')).toHaveCount(count);
});
test('search includes residences and descriptions and exposes all results', async ({ page }) => {
	await page.goto('/collection/');
	const search = page.getByRole('combobox', { name: 'Search the collection', exact: true });
	await search.fill('Haude');
	await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(3);
	await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page).toHaveURL(/\/residences\/haus-der-familie-haude/);
	await expect(page.locator('.sidebar h2')).toBeFocused();
	await expect(page.locator('.gallery-counter')).toHaveText('1 / 11');
});
test('album returns to the same gallery scroll and focus', async ({ page }) => {
	await page.goto('/collection/');
	await expect(page.getByRole('button', { name: 'Entries', exact: true })).toBeEnabled();
	const link = page.locator('[data-entry-key="artwork:19"]');
	// Scroll the rendered container: off-screen card contents have deferred layout.
	await page.locator('.entry-grid li').filter({ has: link }).scrollIntoViewIfNeeded();
	await expect(link).toBeInViewport();
	await link.click({ trial: true });
	const before = (await link.boundingBox())!.y;
	await link.click();
	await expect(page.locator('.gallery-counter')).toHaveText('1 / 13');
	await expect(page.locator('canvas')).toHaveCount(0);
	await page.getByRole('link', { name: 'Back to collection' }).click();
	await expect(link).toBeFocused();
	// Scroll anchoring can adjust scrollTop as deferred cards acquire real heights;
	// the album the reader was viewing must remain at the same visible position.
	expect((await link.boundingBox())!.y).toBeCloseTo(before, 0);
});
test('photo links are shareable and lightbox navigation respects the URL', async ({ page }) => {
	await page.goto(museum + '?view=gallery');
	await page.getByRole('button', { name: /Show image 2 of 17/ }).click();
	await page.getByRole('button', { name: 'View image full screen', exact: true }).click();
	const viewer = page.getByRole('dialog', { name: /Image viewer/ });
	await expect(viewer).toBeVisible();
	await expect(page).toHaveURL(/photo=/);
	const shared = page.url();
	await page.reload();
	await expect(viewer).toBeVisible();
	await page.keyboard.press('ArrowRight');
	expect(page.url()).not.toBe(shared);
	await page.keyboard.press('Escape');
	await expect(viewer).toHaveCount(0);
	await expect(page.locator('.sidebar')).toBeVisible();
	await expect(page).not.toHaveURL(/photo=/);
});
test('Photos mode groups documents and survives detail navigation', async ({ page }) => {
	await page.goto('/collection/?mode=photos&country=Germany');
	await expect(page.locator('.photo-group')).toHaveCount(germanyCount);
	await page.locator('.photo-grid a').first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await page.getByRole('link', { name: 'Back to collection' }).click();
	await expect(page).toHaveURL(/mode=photos/);
	await expect(page.locator('.photo-group')).toHaveCount(germanyCount);
});
test('detail HTML works without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:' + (process.env.PLAYWRIGHT_PORT ?? 4178) + museum);
	await expect(page.locator('.sidebar-desc')).toContainText('Ministry of Culture');
	await expect(page.locator('.gallery')).toBeVisible();
	await expect(page.locator('.gallery img').first()).toBeVisible();
	await context.close();
});
test('image errors leave an explicit fallback and a usable viewer', async ({ page }) => {
	await page.route('**/images/**', (route) => route.abort());
	await page.goto(museum);
	await expect(page.locator('.gallery-stage .media-error')).toBeVisible();
	await page.getByRole('button', { name: 'View image full screen' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('missing works dossier links documentation and a prefilled contribution', async ({ page }) => {
	await page.goto('/missing/');
	await expect(page.locator('.missing-entry')).toHaveCount(missingCount);
	await expect(page.getByRole('heading', { name: 'Works still to be found' })).toBeVisible();
	const contact = page.getByRole('link', { name: 'Contact the research team' }).first();
	await expect(contact).toHaveAttribute('href', /mailto:.*subject=.*artwork/);
	await page
		.getByRole('link', { name: /View entry ·/ })
		.first()
		.click();
	await page.getByRole('link', { name: 'Back to missing works', exact: true }).click();
	await expect(page).toHaveURL(/\/missing\/?$/);
	await accessible(page);
});
test('mobile layout, controls and detail remain accessible', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/collection/');
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	for (const name of ['Country', 'Status', 'Entry type', 'Search the collection']) {
		const box = await page.getByRole('combobox', { name, exact: true }).boundingBox();
		expect(box!.height).toBeGreaterThanOrEqual(44);
	}
	await accessible(page);
	await page.locator('.card-figure').first().click();
	await accessible(page);
});
test('modal contains and restores focus', async ({ page }) => {
	await page.goto('/collection/');
	const opener = page.getByRole('button', { name: 'About', exact: true });
	await expect(opener).toBeEnabled();
	await opener.focus();
	await opener.press('Enter');
	const dialog = page.getByRole('dialog', { name: /About/ });
	await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(dialog).toContainText('Impressum');
	await accessible(page);
	await page.keyboard.press('Escape');
	await expect(opener).toBeFocused();
});
test('offline entries use cached documents and uncached entries show an honest fallback', async ({
	page,
	context,
	browserName
}) => {
	test.skip(
		browserName !== 'chromium',
		'Playwright service-worker/offline emulation is supported on Chromium: https://playwright.dev/docs/service-workers'
	);
	test.setTimeout(60000);
	await page.goto('/collection/');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await page.goto(museum);
	await expect(page.locator('.gallery')).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(async () => {
				const names = (await caches.keys()).filter((name) => name.startsWith('entry-pages-'));
				return (
					await Promise.all(
						names.map(async (name) => (await (await caches.open(name)).keys()).length)
					)
				).reduce((sum, count) => sum + count, 0);
			})
		)
		.toBeGreaterThan(0);
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator('.sidebar-desc')).toContainText('Ministry of Culture');
	await page.goto('/artworks/the-stable-family/');
	await expect(
		page.getByRole('heading', { name: 'This entry is not available offline yet' })
	).toBeVisible();
	await page.getByRole('link', { name: 'Return to the collection' }).click();
	await expect(page.locator('.card')).toHaveCount(corpus.length);
	await context.setOffline(false);
});

test('same numeric artwork and residence ids reset the album and focus', async ({ page }) => {
	await page.goto(museum);
	await page.getByRole('button', { name: /Show image 2 of 17/ }).click();
	const search = page.getByRole('combobox', { name: 'Search the collection', exact: true });
	await search.fill('Haude');
	await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page.locator('.sidebar h2')).toBeFocused();
	await expect(page.locator('.gallery-counter')).toHaveText('1 / 11');
	const commaImage = page.locator('.gallery-thumb img').filter({ visible: true }).nth(1);
	await commaImage.scrollIntoViewIfNeeded();
	await expect
		.poll(() =>
			commaImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
		)
		.toBe(true);
});

test('a failed basemap leaves working gallery navigation and retry', async ({ page }) => {
	await page.route('**/voyager-gl-style/style.json', (route) => route.abort());
	await page.goto('/?country=Germany');
	await expect(page.getByRole('button', { name: 'Retry map' })).toBeVisible({ timeout: 20000 });
	await page.getByRole('link', { name: 'Gallery view', exact: true }).click();
	await expect(page).toHaveURL(/country=Germany/);
	await expect(page.locator('.card')).toHaveCount(germanyCount);
	await expect(page.locator('.map-status')).toBeHidden();
});
