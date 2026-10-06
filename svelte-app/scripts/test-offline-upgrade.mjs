/** Exercise two actual build generations on one origin without modifying the release artifacts. */
import { mkdtemp, cp, symlink, rm, readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, extname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), 'heshmat-upgrade-'));
const originalBuild = join(root, 'build');
const originalVersion = JSON.parse(
	await readFile(join(originalBuild, 'collection.json'), 'utf8')
).build;
let browser;
let server;
try {
	// The second project shares only read-only dependencies and static assets.
	// Build B must never rewrite files that a release or another test will serve.
	for (const path of [
		'src',
		'scripts',
		'package.json',
		'package-lock.json',
		'vite.config.ts',
		'svelte.config.js',
		'tsconfig.json'
	]) {
		await cp(join(root, path), join(temporary, path), { recursive: true });
	}
	const linkType = process.platform === 'win32' ? 'junction' : 'dir';
	await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), linkType);
	await symlink(join(root, 'static'), join(temporary, 'static'), linkType);
	const npmCli = process.env.npm_execpath;
	if (!npmCli) throw new Error('Run this test with npm run test:upgrade.');
	const build = spawn(process.execPath, [npmCli, 'run', 'build'], {
		cwd: temporary,
		env: { ...process.env, GITHUB_SHA: 'offline-upgrade-fixture-b' },
		stdio: 'pipe'
	});
	let buildLog = '';
	build.stdout.on('data', (value) => {
		buildLog += value;
	});
	build.stderr.on('data', (value) => {
		buildLog += value;
	});
	await new Promise((done, reject) => {
		build.on('error', reject);
		build.on('exit', (code) => (code === 0 ? done() : reject(new Error(buildLog))));
	});
	const versions = await Promise.all(
		[originalBuild, join(temporary, 'build')].map(
			async (dir) => JSON.parse(await readFile(join(dir, 'collection.json'), 'utf8')).build
		)
	);
	expect(versions[0]).not.toBe(versions[1]);
	let activeRoot = originalBuild;
	const types = {
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.json': 'application/json',
		'.webmanifest': 'application/manifest+json',
		'.woff2': 'font/woff2',
		'.webp': 'image/webp',
		'.png': 'image/png',
		'.svg': 'image/svg+xml'
	};
	server = createServer(async (request, response) => {
		const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
		const file = resolve(activeRoot, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
		const relativePath = relative(activeRoot, file);
		if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
			response.writeHead(400);
			response.end();
			return;
		}
		try {
			if (!(await stat(file)).isFile()) throw new Error('not a file');
			response.writeHead(200, {
				'Content-Type': types[extname(file)] ?? 'application/octet-stream',
				'Cache-Control': 'no-store'
			});
			createReadStream(file).pipe(response);
		} catch {
			response.writeHead(404);
			response.end('not found');
		}
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const origin = `http://127.0.0.1:${server.address().port}`;
	browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
		args: process.env.PLAYWRIGHT_CHROMIUM_ARGS
			? JSON.parse(process.env.PLAYWRIGHT_CHROMIUM_ARGS)
			: undefined
	});
	const context = await browser.newContext();
	const page = await context.newPage();
	const album = '/artworks/the-hassan-heshmat-museum/';
	await page.goto(origin + album);
	await page.getByText('Use this album offline', { exact: true }).click();
	await page.getByRole('button', { name: 'Save album offline', exact: true }).click();
	await expect(page.getByText('Album saved on this device.', { exact: true })).toBeVisible({
		timeout: 30000
	});
	await page.evaluate(() => navigator.serviceWorker.ready);
	await expect
		.poll(() =>
			page.evaluate(
				async (version) =>
					!!(await (
						await caches.open(`entry-pages-${version}`)
					).match('/artworks/the-hassan-heshmat-museum/')),
				versions[0]
			)
		)
		.toBe(true);
	activeRoot = join(temporary, 'build');
	await page.evaluate(async () => {
		const registration = await navigator.serviceWorker.getRegistration();
		void registration.update();
	});
	// Cache retirement precedes the auto-update reload. Wait for the replacement
	// document to hydrate before navigating, or that reload can interrupt goto().
	await expect(page.locator('meta[name="collection-build"]')).toHaveAttribute(
		'content',
		versions[1],
		{ timeout: 30000 }
	);
	await expect(
		page.getByRole('button', { name: 'View image full screen', exact: true })
	).toBeEnabled();
	// Activation can reload the page while this reads Cache Storage. Retry the
	// entire assertion so a destroyed execution context is not mistaken for a failure.
	await expect(async () => {
		const names = await page.evaluate(async () =>
			(await caches.keys()).filter((name) => name.startsWith('entry-pages-'))
		);
		expect(names).not.toContain(`entry-pages-${versions[0]}`);
	}).toPass({ timeout: 15000 });
	// The new worker re-fetched the saved album's page for its own build before
	// retiring the old one; the album's images were kept, not downloaded again.
	await expect
		.poll(() =>
			page.evaluate(
				async (version) =>
					!!(await (
						await caches.open(`entry-pages-${version}`)
					).match('/artworks/the-hassan-heshmat-museum/')),
				versions[1]
			)
		)
		.toBe(true);
	const savedImages = await page.evaluate(
		async () =>
			(await (await caches.open('saved-albums-v1')).keys()).filter((request) =>
				new URL(request.url).pathname.startsWith('/images/')
			).length
	);
	expect(savedImages).toBeGreaterThan(0);
	// RegisterSW may reload automatically after activation. Use an unseen record to verify the fallback too.
	await page.goto(origin + '/fieldbook/');
	await expect(page.locator('.fieldbook-list')).toContainText('The Hassan Heshmat Museum');
	await expect(page.locator('.fieldbook-list')).toContainText('Available offline');
	await page.goto(origin + '/collection/');
	await context.setOffline(true);
	await page.goto(origin + album);
	const returnedVersion = await page
		.locator('meta[name="collection-build"]')
		.evaluateAll((elements) => elements[0]?.getAttribute('content') ?? null);
	if (returnedVersion) {
		expect(returnedVersion).toBe(versions[1]);
		await expect(
			page.getByRole('button', { name: 'View image full screen', exact: true })
		).toBeEnabled();
	} else
		await expect(
			page.getByRole('heading', { name: 'This entry is not available offline yet' })
		).toBeVisible();
	await page.goto(origin + '/artworks/the-stable-family/');
	await expect(
		page.getByRole('heading', { name: 'This entry is not available offline yet' })
	).toBeVisible();
	await page.goto(origin + '/collection/');
	await expect(page.locator('.collection-page')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Photos', exact: true })).toBeEnabled();
	await context.setOffline(false);
	await page.goto(origin + album);
	await expect
		.poll(() =>
			page.evaluate(
				async (version) =>
					!!(await (
						await caches.open(`entry-pages-${version}`)
					).match('/artworks/the-hassan-heshmat-museum/')),
				versions[1]
			)
		)
		.toBe(true);
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator('.gallery-counter')).toHaveText('1 / 17');
	await expect(
		page.getByRole('button', { name: 'View image full screen', exact: true })
	).toBeEnabled();
	console.log(
		`Offline upgrade passed: ${versions[0]} → ${versions[1]}; old HTML retired, saved album kept its images and refreshed its page, new shell works offline.`
	);
} finally {
	await browser?.close();
	if (server) await new Promise((resolve) => server.close(resolve));
	await rm(temporary, { recursive: true, force: true });
}

expect(JSON.parse(await readFile(join(originalBuild, 'collection.json'), 'utf8')).build).toBe(
	originalVersion
);
