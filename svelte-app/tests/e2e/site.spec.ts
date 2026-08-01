import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectAccessible(page: Page) {
	const result = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
		.analyze();
	const summary = result.violations.map((violation) => ({
		id: violation.id,
		impact: violation.impact,
		targets: violation.nodes.map((node) => node.target)
	}));
	expect(result.violations, JSON.stringify(summary, null, 2)).toEqual([]);
}

test('direct collection visits stay map-free and accessible', async ({ page }) => {
	const requests: string[] = [];
	const pwaFailures: string[] = [];
	page.on('request', (request) => requests.push(request.url()));
	page.on('response', (response) => {
		if (response.status() >= 400 && /(?:sw\.js|manifest\.webmanifest)$/.test(response.url())) {
			pwaFailures.push(`${response.status()} ${response.url()}`);
		}
	});

	await page.goto('/collection/', { waitUntil: 'networkidle' });
	await expect(page.getByRole('heading', { name: 'The collection', exact: true })).toBeVisible();
	await expect(page.locator('canvas')).toHaveCount(0);
	expect(requests.some((url) => /maplibre(?:[.-])|cartocdn\.com/.test(url))).toBe(false);
	expect(pwaFailures).toEqual([]);
	await expectAccessible(page);
});

test('filters and keyboard search keep navigation shareable', async ({ page }) => {
	await page.goto('/collection/');
	const egypt = page.getByRole('button', { name: /^Egypt \d+$/ });
	await egypt.click();
	await expect(egypt).toHaveAttribute('aria-pressed', 'true');
	await expect(page).toHaveURL(/filter=Egypt/);

	const search = page.getByRole('combobox', { name: 'Search artworks' });
	await search.fill('Cairo');
	await expect(page.getByRole('option').first()).toBeVisible();
	await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page).toHaveURL(/\/artworks\/[^/]+\/(?:\?.*)?$/);

	const detailHeading = page.locator('aside.sidebar.open h2');
	await expect(detailHeading).toBeVisible();
	await expect(detailHeading).toBeFocused();
});

test('browse panel and modal restore and contain keyboard focus', async ({ page }) => {
	await page.goto('/');
	const browse = page.getByRole('button', { name: 'Browse the collection' });
	await browse.click();
	const collection = page.getByRole('region', { name: /Browse the collection/ });
	await expect(collection).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(collection).toHaveAttribute('inert', '');
	await expect(browse).toBeFocused();

	await page.getByRole('button', { name: 'About', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: /About/ });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
	await expectAccessible(page);
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
});

test.describe('mobile ergonomics', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('layout has no horizontal overflow and primary controls meet touch targets', async ({
		page
	}) => {
		await page.goto('/collection/');
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		expect(overflow).toBeLessThanOrEqual(0);

		for (const control of [
			page.getByRole('button', { name: /^All \d+$/ }),
			page.getByRole('button', { name: 'About', exact: true }),
			page.getByRole('combobox', { name: 'Search artworks' })
		]) {
			const box = await control.boundingBox();
			expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
		}
		await expectAccessible(page);
	});
});
