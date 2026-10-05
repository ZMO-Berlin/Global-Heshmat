import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const museum = '/artworks/the-hassan-heshmat-museum/';
async function workerReady(page: Page) {
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
		if (!navigator.serviceWorker.controller)
			await new Promise<void>((resolve) =>
				navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
					once: true
				})
			);
	});
}
async function documentSaved(page: Page, path: string) {
	await expect
		.poll(() =>
			page.evaluate(async (path) => {
				for (const name of await caches.keys())
					if (name.startsWith('entry-pages-') && (await (await caches.open(name)).match(path)))
						return true;
				return false;
			}, path)
		)
		.toBe(true);
}
test('ordinary card navigation before activation saves a canonical offline document', async ({
	page,
	context,
	browserName
}) => {
	test.skip(browserName !== 'chromium', 'Service worker regression is covered in Chromium.');
	await page.goto('/collection/?country=Egypt');
	await page.locator('[data-entry-key="artwork:3"]').click();
	await expect(page).toHaveURL(/country=Egypt/);
	await workerReady(page);
	await documentSaved(page, museum);
	await context.setOffline(true);
	await page.goto(museum);
	await expect(page.locator('.sidebar h2')).toHaveText('The Hassan Heshmat Museum');
	await expect(page.getByRole('button', { name: 'View image full screen' })).toBeEnabled();
	await page.reload();
	await expect(page.locator('.gallery-counter')).toHaveText('1 / 17');
});
test('closing app-created modal history returns to the album and Back reaches the collection', async ({
	page
}) => {
	await page.goto('/collection/');
	await page.locator('[data-entry-key="artwork:3"]').click();
	await page.getByRole('button', { name: 'View image full screen', exact: true }).click();
	await expect(page.getByRole('dialog', { name: /Image viewer/ })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page).not.toHaveURL(/photo=/);
	await page.goBack();
	await expect(page).toHaveURL(/\/collection\//);
	await page.goForward();
	await expect(page).toHaveURL(/the-hassan-heshmat-museum/);
	await page.goForward();
	await expect(page.getByRole('dialog', { name: /Image viewer/ })).toBeVisible();
});
test('About open, Back, Forward and close retain a single album history entry', async ({
	page
}) => {
	await page.goto('/collection/');
	await page.locator('[data-entry-key="artwork:3"]').click();
	await page.getByRole('button', { name: 'About', exact: true }).click();
	await expect(page).toHaveURL(/about=1/);
	await page.goBack();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await page.goForward();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page).not.toHaveURL(/about=/);
	await page.goBack();
	await expect(page).toHaveURL(/\/collection\//);
});
test('direct shared modal links close in place and invalid media never traps Escape', async ({
	page
}) => {
	await page.goto(museum + '?photo=Entrance%20Museum');
	await expect(page.getByRole('dialog', { name: /Image viewer/ })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL(new RegExp(museum + '$'));
	await page.goto(museum + '?photo=not-a-real-image');
	// No dialog also matches the prerendered page; wait for keyboard handlers to hydrate.
	await expect(
		page.getByRole('button', { name: 'View image full screen', exact: true })
	).toBeEnabled();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL(/\/collection\//);
});
test('404 recovery opens the real collection', async ({ page }) => {
	await page.goto('/not-a-real-record/');
	await expect(page.getByRole('alert')).toBeVisible();
	await page.getByRole('link', { name: 'Browse the collection', exact: true }).click();
	await expect(page.locator('.collection-page')).toBeVisible();
	await expect(page).toHaveURL(/\/collection\//);
});
test('citation export, comparison and fieldbook persist without fabricating metadata', async ({
	page
}) => {
	await page.goto(museum);
	await page.getByText('Cite and export this entry', { exact: true }).click();
	await expect(page.locator('.citation')).toContainText('Record artwork:3');
	await expect(page.locator('.citation')).toContainText('n.d.');
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'BibTeX', exact: true }).click();
	expect((await downloadPromise).suggestedFilename()).toBe('artwork-3.bib');
	await page.getByText('Compare two images', { exact: true }).click();
	await page.getByLabel('Second image', { exact: true }).selectOption('2');
	await expect(page.locator('.comparison-image img')).toHaveCount(2);
	await expect
		.poll(() =>
			page
				.locator('.comparison-image img')
				.evaluateAll((images: HTMLImageElement[]) =>
					images.every((image) => image.complete && image.naturalWidth > 0)
				)
		)
		.toBe(true);
	await page.getByRole('button', { name: 'Add to fieldbook', exact: true }).click();
	await page.getByRole('link', { name: 'Open fieldbook' }).click();
	await expect(page.locator('.fieldbook-list li')).toHaveCount(1);
	await page.reload();
	await expect(page.locator('.fieldbook-list li')).toHaveCount(1);
	await expect(page.locator('.fieldbook-list')).toContainText('Download needed');
	await expect(page.locator('.fieldbook-list')).toContainText('The Hassan Heshmat Museum');
	await page.locator('.fieldbook-list a').click();
	await page.getByRole('link', { name: 'Back to fieldbook', exact: true }).click();
	await expect(page).toHaveURL(/\/fieldbook\//);
});
test('saved albums serve reading images offline and report eviction accurately', async ({
	page,
	context,
	browserName
}) => {
	test.skip(browserName !== 'chromium', 'Service worker regression is covered in Chromium.');
	await page.goto('/artworks/the-dawn-of-egypt/');
	await page.getByText('Use this album offline', { exact: true }).click();
	await page.getByRole('button', { name: 'Save album offline', exact: true }).click();
	await expect(page.getByText('Album saved on this device.', { exact: true })).toBeVisible({
		timeout: 30000
	});
	await workerReady(page);
	await context.setOffline(true);
	await page.reload();
	await page.getByRole('button', { name: 'View image full screen', exact: true }).click();
	await expect
		.poll(() =>
			page
				.locator('.lightbox-img img')
				.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
		)
		.toBe(true);
	await page.keyboard.press('Escape');
	await page.getByRole('link', { name: 'Open fieldbook' }).click();
	await expect(page.locator('.fieldbook-list')).toContainText('Available offline');
	await page.evaluate(async () => {
		for (const name of await caches.keys())
			if (name.startsWith('saved-album-')) await caches.delete(name);
	});
	await page.getByRole('button', { name: 'Check availability' }).click();
	await expect(page.locator('.fieldbook-list')).toContainText('Download needed');
});
test('lightbox traps full Tab cycles, isolates the background and restores focus', async ({
	page
}) => {
	await page.goto(museum);
	const opener = page.getByRole('button', { name: 'View image full screen', exact: true });
	await opener.click();
	const viewer = page.getByRole('dialog', { name: /Image viewer/ });
	const close = viewer.getByRole('button', { name: 'Close', exact: true });
	await expect(close).toBeFocused();
	const count = await viewer.locator('button, a[href]').count();
	for (let i = 0; i < count; i++) await page.keyboard.press('Tab');
	await expect(close).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(viewer.locator('.lightbox-thumb').last()).toBeFocused();
	expect(
		await page
			.locator('main')
			.evaluate((element: HTMLElement) => element.inert || !!element.closest('[inert]'))
	).toBe(true);
	const result = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
		.analyze();
	expect(result.violations).toEqual([]);
	await page.keyboard.press('Escape');
	await expect(opener).toBeFocused();
});
test('research pages and image comparison fit narrow screens and remain accessible', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	for (const path of ['/trails/', '/fieldbook/', museum]) {
		await page.goto(path);
		if (path === museum) await page.getByText('Compare two images', { exact: true }).click();
		const result = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
			.analyze();
		expect(result.violations, path).toEqual([]);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
		).toBe(true);
	}
});

test('healthy local map supports marker selection and preserves a panned camera through About', async ({
	page,
	browserName
}) => {
	test.skip(browserName !== 'chromium', 'Deterministic WebGL worker coverage runs in Chromium.');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.route('**/voyager-gl-style/style.json', (route) =>
		route.fulfill({
			json: {
				version: 8,
				sources: {},
				layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#eeeeee' } }]
			}
		})
	);
	const workers: string[] = [];
	page.on('worker', (worker) => workers.push(worker.url()));
	await page.goto('/?q=Haude');
	await expect(page.locator('.map-status')).toHaveCount(0, { timeout: 20000 });
	const canvas = page.locator('.maplibregl-canvas');
	await expect(canvas).toBeVisible();
	await expect.poll(() => workers.some((url) => /_app\/immutable\/workers\//.test(url))).toBe(true);
	const box = (await canvas.boundingBox())!;
	// Wait for the real GeoJSON worker to paint the single residence marker.
	const { default: sharp } = await import('sharp');
	await expect
		.poll(async () => {
			const { data } = await sharp(await canvas.screenshot())
				.extract({
					left: Math.floor(box.width / 2) - 5,
					top: Math.floor(box.height / 2) - 5,
					width: 10,
					height: 10
				})
				.removeAlpha()
				.raw()
				.toBuffer({ resolveWithObject: true });
			return [...data].some((value) => value !== 238);
		})
		.toBe(true);
	await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
	await expect(page).toHaveURL(/residences\/haus-der-familie-haude/);
	await expect(page.locator('.sidebar h2')).toContainText('Haude');
	await page.getByRole('link', { name: 'Back to collection', exact: true }).click();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 40, { steps: 10 });
	await page.mouse.up();
	// Screenshot assertions wait for a settled rendered frame before comparing.
	let before = await canvas.screenshot({ animations: 'disabled' });
	await expect
		.poll(async () => {
			const frame = await canvas.screenshot({ animations: 'disabled' });
			const settled = frame.equals(before);
			before = frame;
			return settled;
		})
		.toBe(true);
	await page.getByRole('button', { name: 'About', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect
		.poll(async () => Buffer.compare(await canvas.screenshot({ animations: 'disabled' }), before))
		.toBe(0);
});
