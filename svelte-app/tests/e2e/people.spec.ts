import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { escapeRegExp, opening, passageWord, peopleData, profileWhere } from './people-data';

// Names, passages and counts come from the data (see people-data.ts): an
// editor's correction to a profile must not fail these tests.
const corpus: { key: string; slug: string; kind: string }[] = JSON.parse(
	readFileSync(new URL('../../build/collection.json', import.meta.url), 'utf8')
).records;
const profilePath = (slug: string) => new RegExp(`/people/${escapeRegExp(slug)}/`);
const searchBox = (page: Page) =>
	page.getByRole('combobox', { name: 'Search the collection', exact: true });

test('people sorting combines with filters and survives profile navigation, reload and history', async ({
	page
}) => {
	const { people, groups } = peopleData();
	// A group with several members, so its order is observable.
	const group = groups.find((g) => people.filter((p) => p.groups.includes(g.id)).length > 1);
	test.skip(!group, 'No People group has two profiles');
	await page.goto('/people/');
	const names = page.locator('.people-list li > a');
	const sort = page.getByRole('combobox', { name: 'Sort by', exact: true });
	await expect(sort).toHaveValue('name-asc');
	await expect(sort.locator('option')).toHaveText(['Name (A–Z)', 'Name (Z–A)', 'Group']);
	await expect(names).toHaveCount(people.length);
	const ascending = await names.allTextContents();
	await sort.selectOption('name-desc');
	await expect(names).toHaveText([...ascending].reverse());
	await page.goBack();
	await expect(sort).toHaveValue('name-asc');
	await sort.selectOption('name-desc');
	await page.getByRole('combobox', { name: 'Group', exact: true }).selectOption(group!.id);
	const members = ascending
		.filter((name) => people.some((p) => p.name === name && p.groups.includes(group!.id)))
		.reverse();
	await expect(names).toHaveText(members);
	await names.last().click();
	await page.getByRole('link', { name: 'Back to People', exact: true }).click();
	await expect(sort).toHaveValue('name-desc');
	await page.reload();
	await expect(sort).toHaveValue('name-desc');
	await expect(names).toHaveText(members);
	await page.getByRole('button', { name: 'Clear all filters' }).click();
	await expect(sort).toHaveValue('name-desc');
	await sort.selectOption('name-asc');
	await expect(names).toHaveText(ascending);
	await expect(page).not.toHaveURL(/sort=/);
});

test('People has searchable document groups, shareable facets and clear', async ({ page }) => {
	const { people } = peopleData();
	const person = profileWhere(
		(p) => p.places.length > 0 && p.relatedEntries.length > 0,
		'mentions a place and links to a collection entry'
	);
	const query = person.name.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a));
	const items = page.locator('.people-list li');
	await page.goto('/collection/');
	await page.getByRole('combobox', { name: 'Entry type', exact: true }).selectOption('person');
	await expect(page).toHaveURL(/\/people\//);
	await expect(items).toHaveCount(people.length);
	await page.getByRole('combobox', { name: 'Group', exact: true }).selectOption(person.groups[0]);
	await page
		.getByRole('combobox', { name: 'Place mentioned', exact: true })
		.selectOption(person.places[0]);
	const search = searchBox(page);
	await search.fill(query);
	await search.press('Escape');
	await expect(page).toHaveURL(/group=.*place=.*q=/);
	const profile = page.getByRole('link', { name: person.name, exact: true });
	await expect(profile).toBeVisible();
	const filtered = await items.count();
	expect(filtered).toBeLessThan(people.length);
	await page.reload();
	await expect(items).toHaveCount(filtered);
	await profile.click();
	await expect(page.getByRole('heading', { name: person.name, exact: true })).toBeVisible();
	await expect(page.locator('.related a')).toHaveCount(person.relatedEntries.length);
	await page.getByRole('link', { name: 'Back to People' }).click();
	await expect(items).toHaveCount(filtered);
	await page.getByRole('button', { name: 'Clear all filters' }).click();
	await expect(items).toHaveCount(people.length);
	await expect(page).not.toHaveURL(/group=|place=|q=/);
	await page.getByRole('combobox', { name: 'Entry type', exact: true }).selectOption('residence');
	await expect(page).toHaveURL(/\/collection\/\?type=residence/);
	await expect(page.locator('.card')).toHaveCount(
		corpus.filter((record) => record.kind === 'residence').length
	);
	await page.goBack();
	await expect(items).toHaveCount(people.length);
});

test('global search finds passages and people have reciprocal collection links', async ({
	page
}) => {
	const person = profileWhere(
		(p) => p.relatedEntries.some((key) => key.startsWith('artwork:')) && !!passageWord(p),
		'links to an artwork'
	);
	const artwork = corpus.find((record) =>
		person.relatedEntries.some((key) => key.startsWith('artwork:') && key === record.key)
	)!;
	await page.goto('/collection/');
	const search = searchBox(page);
	await search.fill(person.name);
	await page.getByRole('option', { name: new RegExp(`^${escapeRegExp(person.name)}`) }).click();
	await expect(page).toHaveURL(profilePath(person.slug));
	await expect(page.locator('.biography')).toContainText(opening(person.paragraphs[0]));
	const target = `/artworks/${artwork.slug}`;
	await page.locator(`.related a[href*="${target}?"], .related a[href*="${target}/"]`).click();
	await expect(page).toHaveURL(new RegExp(`/artworks/${escapeRegExp(artwork.slug)}`));
	await page
		.locator('.related-people')
		.getByRole('link', { name: person.name, exact: true })
		.click();
	await expect(page).toHaveURL(profilePath(person.slug));
	await page.getByRole('link', { name: 'Gallery view', exact: true }).click();
	await expect(page).toHaveURL(/\/collection\/(?:\?|$)/);
	await expect(page.getByRole('heading', { name: 'The collection', exact: true })).toBeVisible();
	// A word from the passage, not the name: the collection page searches profile text.
	await search.fill(passageWord(person));
	await search.press('Enter');
	await expect(page.locator('.people-results')).toContainText(person.name);
	await expect(page.getByRole('heading', { name: 'No entries match these filters' })).toHaveCount(
		0
	);
});

test('people keyboard search, cross-references and empty recovery', async ({ page }) => {
	const { people, groups, places } = peopleData();
	const person = profileWhere((p) => p.seeAlso.length > 0, 'refers to another profile');
	const other = people.find((p) => p.slug === person.seeAlso[0])!;
	await page.goto('/people/');
	const search = searchBox(page);
	await search.fill(person.name);
	const options = page.getByRole('listbox').getByRole('option');
	await expect(options.first()).toBeVisible();
	// Other profiles may quote this name: move to its own option with the keyboard.
	const index = (await options.allTextContents()).findIndex((text) => text.startsWith(person.name));
	expect(index).toBeGreaterThanOrEqual(0);
	for (let step = 0; step <= index; step++) await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page).toHaveURL(profilePath(person.slug));
	await page
		.locator('.biography .related-links')
		.getByRole('link', { name: other.name, exact: true })
		.first()
		.click();
	await expect(page).toHaveURL(profilePath(other.slug));
	await expect(page.locator('.biography')).toContainText(opening(other.paragraphs[0]));
	const empty = groups
		.flatMap((group) => places.map((place) => [group.id, place] as const))
		.find(
			([group, place]) => !people.some((p) => p.groups.includes(group) && p.places.includes(place))
		);
	test.skip(!empty, 'Every group mentions every place');
	await page.goto(`/people/?${new URLSearchParams({ group: empty![0], place: empty![1] })}`);
	await expect(page.getByRole('heading', { name: 'No people match these filters' })).toBeVisible();
	await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
	await expect(page.locator('.people-list li')).toHaveCount(people.length);
});

test('People and a long profile work on mobile with accessible controls', async ({ page }) => {
	const length = (p: { paragraphs: string[] }) => p.paragraphs.join(' ').length;
	const longest = peopleData().people.reduce((a, b) => (length(b) > length(a) ? b : a));
	await page.setViewportSize({ width: 390, height: 844 });
	for (const path of ['/people/', `/people/${longest.slug}/`]) {
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
	const { people } = peopleData();
	const person = people[0];
	const path = `/people/${person.slug}/`;
	await page.goto('/people/');
	await page.getByRole('link', { name: person.name, exact: true }).click();
	await expect(page).toHaveURL(profilePath(person.slug));
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
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
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator('.biography')).toContainText(opening(person.paragraphs[0]));
	await page.goto('/people/');
	await expect(page.locator('.people-list li')).toHaveCount(people.length);
});

test('profiles are readable with JavaScript disabled', async ({ browser }) => {
	const { people } = peopleData();
	// Prefer a profile with notes, so the notes section is covered too.
	const person = people.find((p) => p.notes.length > 0) ?? people[0];
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(`/people/${person.slug}/`);
	await expect(page.getByRole('heading', { name: person.name, exact: true })).toBeVisible();
	for (const text of [...person.paragraphs, ...person.contexts])
		await expect(page.locator('.biography')).toContainText(opening(text));
	if (person.notes.length)
		await expect(page.locator('.notes')).toContainText(opening(person.notes[0]));
	await context.close();
});

test('grouping follows the source document and survives a reload', async ({ page }) => {
	const { people, groups } = peopleData();
	const populated = groups.filter((g) => people.some((p) => p.groups.includes(g.id)));
	await page.goto('/people/');
	await page.getByRole('combobox', { name: 'Sort by', exact: true }).selectOption('group');
	await expect(page).toHaveURL(/sort=group/);
	const headings = page.locator('.people-group h3');
	await expect(headings).toHaveText(populated.map((g) => g.name));
	// A profile listed in two source groups appears under both.
	const shared = people.find((p) => p.groups.length > 1);
	if (shared)
		await expect(page.getByRole('link', { name: shared.name, exact: true })).toHaveCount(
			shared.groups.length
		);
	await expect(page.getByRole('status')).toHaveText(`${people.length} profiles`);
	await page.reload();
	await expect(headings).toHaveText(populated.map((g) => g.name));
	const last = populated[populated.length - 1];
	await page.getByRole('combobox', { name: 'Group', exact: true }).selectOption(last.id);
	await expect(headings).toHaveText([last.name]);
});

test('a shortened excerpt ends with a Read more link to the profile', async ({ page }) => {
	const { people } = peopleData();
	await page.goto('/people/');
	await expect(page.locator('.people-list li')).toHaveCount(people.length);
	const item = page
		.locator('.people-list li')
		.filter({ has: page.locator('.more') })
		.first();
	test.skip(!(await item.count()), 'Every People passage is short enough to show in full');
	const name = (await item.locator('> a').textContent())!;
	const person = people.find((p) => p.name === name)!;
	// Only "Read more" is the link; the ellipsis stays with the passage.
	await expect(item.locator('.more')).toHaveText('Read more');
	await expect(item.locator('.excerpt')).toContainText('… Read more');
	await item.getByRole('link', { name: `Read more about ${name}`, exact: true }).click();
	await expect(page).toHaveURL(profilePath(person.slug));
});

test('a profile lists its cited sources as links', async ({ page }) => {
	const person = profileWhere((p) => p.sources.some((s) => s.url), 'cites a source with a URL');
	const source = person.sources.find((s) => s.url)!;
	await page.goto(`/people/${person.slug}/`);
	await expect(
		page.locator('.sources').getByRole('link', { name: source.label, exact: true })
	).toHaveAttribute('href', source.url!);
});
