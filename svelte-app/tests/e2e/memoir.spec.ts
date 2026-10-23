import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// Counts and names come from the generated data, so a new extraction run (or an
// editor's validation) does not break these tests.
const memoir: {
	method: { mentions: number };
	entities: { type: string; name: string; years?: number[]; record?: string }[];
} = JSON.parse(readFileSync(new URL('../../src/lib/data/memoir.json', import.meta.url), 'utf8'));
const ofType = (type: string) => memoir.entities.filter((e) => e.type === type);
const years = [...new Set(ofType('exhibition').flatMap((e) => e.years?.slice(0, 1) ?? []))];

async function accessible(page: Page) {
	const result = await new AxeBuilder({ page })
		.exclude('.memoir-map')
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
		.analyze();
	expect(
		result.violations,
		JSON.stringify(
			result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))
		)
	).toEqual([]);
}

test('the memoir view lists what the book names and explains its method', async ({ page }) => {
	await page.goto('/collection/');
	await page.locator('header').getByRole('link', { name: 'Memoir', exact: true }).click();
	await expect(page).toHaveURL(/\/memoir\/?$/);
	await expect(page.getByRole('heading', { name: 'Memoir', exact: true })).toBeVisible();
	for (const name of [
		'Places',
		'Exhibitions',
		'People',
		'In the collection',
		'How this page was made'
	]) {
		await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
	}
	// Every dated exhibition year has its row in the timeline.
	const timeline = page.locator('.timeline .year');
	for (const year of years) await expect(timeline.filter({ hasText: String(year) })).toHaveCount(1);
	// The method says plainly that the extraction is experimental and unvalidated.
	const method = page.locator('#method');
	await expect(method).toContainText('experiment');
	await expect(method).toContainText(String(memoir.method.mentions));
	// People come in pages of 20, most named first; the last page holds the rest.
	const people = ofType('person').length;
	const pages = Math.ceil(people / 20);
	const list = page.locator('#people .people > li');
	await expect(list).toHaveCount(Math.min(20, people));
	const pager = page.getByRole('navigation', { name: 'Pages of people' });
	await expect(pager.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
	await pager.getByRole('button', { name: 'Next', exact: true }).click();
	// A new page is read from its top: the heading is in view and focused.
	const heading = page.getByRole('heading', { name: 'People', exact: true });
	await expect(heading).toBeFocused();
	await expect(heading).toBeInViewport();
	await expect(list.first()).toBeInViewport();
	await expect(pager.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await pager.getByRole('button', { name: `Page ${pages}`, exact: true }).click();
	await expect(list).toHaveCount(people - (pages - 1) * 20);
	await expect(page.getByRole('status').filter({ hasText: `of ${people}` })).toContainText(
		`${(pages - 1) * 20 + 1}–${people} of ${people}`
	);
	await expect(pager.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
	await accessible(page);
});

test('records the book mentions lead to their albums and back', async ({ page }) => {
	await page.goto('/memoir/');
	const first = page.locator('#collection .records a').first();
	await first.click();
	await expect(page).toHaveURL(/\/(artworks|residences)\//);
	await page.getByRole('link', { name: 'Back to memoir', exact: true }).click();
	await expect(page).toHaveURL(/\/memoir\/?$/);
});

test('the memoir tab is within thumb reach on phones', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/memoir/');
	const tab = page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: 'Memoir', exact: true });
	await expect(tab).toBeVisible();
	await expect(tab).toHaveAttribute('aria-current', 'page');
	const box = (await tab.boundingBox())!;
	expect(box.y + box.height).toBeGreaterThan(844 - 70);
	expect(box.height).toBeGreaterThanOrEqual(44);
	await accessible(page);
});
