import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('people sorting combines with filters and survives profile navigation, reload and history', async ({
	page
}) => {
	await page.goto('/people/');
	const names = page.locator('.people-list li > a');
	const sort = page.getByRole('combobox', { name: 'Sort by', exact: true });
	await expect(sort).toHaveValue('name-asc');
	await expect(sort.locator('option')).toHaveText(['Name (A–Z)', 'Name (Z–A)']);
	await expect(names.first()).toHaveText('Dr. Abe Jan Koldijk');
	await sort.selectOption('name-desc');
	await expect(names.first()).toHaveText('Youssef Francis');
	await page.goBack();
	await expect(sort).toHaveValue('name-asc');
	await sort.selectOption('name-desc');
	await page.getByRole('combobox', { name: 'Group', exact: true }).selectOption('collectors');
	await expect(names).toHaveText([
		'Marie L. Bishara',
		'Louis Bishara',
		'Jeffrey Adams / Samir Moussa',
		'Farid Khamis'
	]);
	await names.last().click();
	await page.getByRole('link', { name: 'Back to People', exact: true }).click();
	await expect(sort).toHaveValue('name-desc');
	await page.reload();
	await expect(sort).toHaveValue('name-desc');
	await expect(names).toHaveCount(4);
	await page.getByRole('button', { name: 'Clear all filters' }).click();
	await expect(sort).toHaveValue('name-desc');
	await sort.selectOption('name-asc');
	await expect(names.first()).toHaveText('Dr. Abe Jan Koldijk');
	await expect(page).not.toHaveURL(/sort=/);
});

test('People has searchable document groups, shareable facets and clear', async ({ page }) => {
	await page.goto('/collection/');
	await page.getByRole('combobox', { name: 'Entry type', exact: true }).selectOption('person');
	await expect(page).toHaveURL(/\/people\//);
	await expect(page.locator('.people-list li')).toHaveCount(31);
	await page.getByRole('combobox', { name: 'Group', exact: true }).selectOption('collectors');
	await page
		.getByRole('combobox', { name: 'Place mentioned', exact: true })
		.selectOption('10th of Ramadan city');
	const search = page.getByRole('combobox', { name: 'Search the collection', exact: true });
	await search.fill('Bishara');
	await search.press('Escape');
	await expect(page.locator('.people-list li')).toHaveCount(2);
	await page.reload();
	await expect(page.locator('.people-list li')).toHaveCount(2);
	await page.getByRole('link', { name: 'Marie L. Bishara', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Marie L. Bishara', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'The Dawn of Egypt', exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Back to People' }).click();
	await expect(page.locator('.people-list li')).toHaveCount(2);
	await page.getByRole('button', { name: 'Clear all filters' }).click();
	await expect(page.locator('.people-list li')).toHaveCount(31);
	await expect(page).not.toHaveURL(/group=|place=|q=/);
	await page.getByRole('combobox', { name: 'Entry type', exact: true }).selectOption('residence');
	await expect(page).toHaveURL(/\/collection\/\?type=residence/);
	await expect(page.locator('.card')).toHaveCount(4);
	await page.goBack();
	await expect(page.locator('.people-list li')).toHaveCount(31);
});

test('global search finds passages and people have reciprocal collection links', async ({
	page
}) => {
	await page.goto('/collection/');
	const search = page.getByRole('combobox', { name: 'Search the collection', exact: true });
	await search.fill('Koldijk');
	await page.getByRole('option', { name: /Dr. Abe Jan Koldijk/ }).click();
	await expect(page).toHaveURL(/\/people\/abe-jan-koldijk/);
	await expect(page.locator('.biography')).toContainText('Maaike Muyssen');
	await page.locator('.related a').click();
	await expect(page).toHaveURL(/\/artworks\/mosaics/);
	await page.locator('.related-people').getByRole('link', { name: 'Dr. Abe Jan Koldijk' }).click();
	await expect(page).toHaveURL(/\/people\/abe-jan-koldijk/);
	await page.getByRole('link', { name: 'Gallery view', exact: true }).click();
	await expect(page).toHaveURL(/\/collection\/(?:\?|$)/);
	await expect(page.getByRole('heading', { name: 'The collection', exact: true })).toBeVisible();
	await search.fill('Sohair');
	await search.press('Enter');
	await expect(page.locator('.people-results')).toContainText('Kamal es-Sarrag');
	await expect(page.getByRole('heading', { name: 'No entries match these filters' })).toHaveCount(
		0
	);
});

test('people keyboard search, cross-references and empty recovery', async ({ page }) => {
	await page.goto('/people/');
	const search = page.getByRole('combobox', { name: 'Search the collection', exact: true });
	await search.fill('Nadine Nour Eddine');
	await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page).toHaveURL(/\/people\/nadine-nour-eddine/);
	await page.getByRole('link', { name: 'Emad Abu Ghazi', exact: true }).click();
	await expect(page.locator('.biography')).toContainText('Nadine Nour el-Din');
	await page.goto('/people/?group=selb&place=Paris');
	await expect(page.getByRole('heading', { name: 'No people match these filters' })).toBeVisible();
	await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
	await expect(page.locator('.people-list li')).toHaveCount(31);
});

test('People and a long profile work on mobile with accessible controls', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	for (const path of ['/people/', '/people/ronald-pritchard/']) {
		await page.goto(path);
		await expect(page.getByRole('combobox', { name: 'Entry type', exact: true })).toBeEnabled();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		expect(
			await page.evaluate(
				() =>
					document.querySelector('.header h1')!.clientWidth >=
					document.querySelector('.wordmark-reset')!.scrollWidth
			)
		).toBe(true);
		const touchTargets = await page.locator('.on-header .switch:visible').evaluateAll((links) =>
			links.map((link) => ({
				width: link.getBoundingClientRect().width,
				height: link.getBoundingClientRect().height
			}))
		);
		expect(touchTargets.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	}
});

test('a visited profile and People index remain readable offline', async ({
	page,
	context,
	browserName
}) => {
	test.skip(browserName !== 'chromium', 'Service worker regression is covered in Chromium.');
	await page.goto('/people/');
	await page.getByRole('link', { name: 'Saeed Sadr', exact: true }).click();
	await expect(page).toHaveURL(/\/people\/saeed-sadr/);
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await expect
		.poll(() =>
			page.evaluate(async () => {
				for (const name of await caches.keys())
					if (
						name.startsWith('entry-pages-') &&
						(await (await caches.open(name)).match('/people/saeed-sadr/'))
					)
						return true;
				return false;
			})
		)
		.toBe(true);
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator('.biography')).toContainText('Camberwell Institute');
	await page.goto('/people/');
	await expect(page.locator('.people-list li')).toHaveCount(31);
});

test('profiles are readable with JavaScript disabled', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/people/gertrude-fritz-steppat/');
	await expect(
		page.getByRole('heading', { name: 'Gertraud Steppat / Prof. Fritz Steppat', exact: true })
	).toBeVisible();
	await expect(page.locator('.biography')).toContainText('Bei der Eröffnung');
	await expect(page.locator('.notes')).toContainText('Ambassador Dr. Kramer');
	await context.close();
});
