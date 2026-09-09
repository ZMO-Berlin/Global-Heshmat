import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'node:net';
import lighthouse, { desktopConfig } from 'lighthouse';
const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.LIGHTHOUSE_PORT ?? 4174);
const origin = `http://127.0.0.1:${port}`;
const runs = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 5 || runs % 2 !== 1)
	throw new Error('LIGHTHOUSE_RUNS must be 1, 3 or 5');
const targets = [
	{ id: 'collection-desktop', path: '/collection/', desktop: true },
	{ id: 'collection-mobile', path: '/collection/', desktop: false },
	{ id: 'entry-mobile', path: '/artworks/the-hassan-heshmat-museum/', desktop: false },
	{ id: 'missing-mobile', path: '/missing/', desktop: false }
];
const thresholds = { performance: 0.9, accessibility: 1, 'best-practices': 0.95, seo: 1 };
const reports = join(root, '.lighthouse');
mkdirSync(reports, { recursive: true });
const server = spawn(
	process.execPath,
	[
		'node_modules/vite/bin/vite.js',
		'preview',
		'--host',
		'127.0.0.1',
		'--port',
		String(port),
		'--strictPort'
	],
	{ cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
);
let serverError = '';
server.stderr.on('data', (chunk) => (serverError += String(chunk)));
server.stdout.resume();
async function ready() {
	const until = Date.now() + 60000;
	while (Date.now() < until) {
		if (server.exitCode !== null) throw new Error(`Preview failed: ${serverError}`);
		try {
			if ((await fetch(origin + '/collection/')).ok) return;
		} catch {
			/* Wait for the local preview to become ready. */
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error('Preview startup timed out');
}
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const failures = [];
const summary = [];
let chrome;
try {
	await ready();
	for (const target of targets) {
		// Slow-4G mobile simulation has its own measured regression floor. Keep
		// this distinct from a field Core Web Vitals assessment or a score guarantee.
		const floors = { ...thresholds, performance: target.desktop ? 0.9 : 0.85 };
		const lcpLimit = target.desktop ? 2500 : 4000;
		const results = [];
		for (let run = 1; run <= runs; run++) {
			// Independent browser profiles keep measurements cold and release trace memory.
			const probe = createServer();
			await new Promise((resolve, reject) => {
				probe.once('error', reject);
				probe.listen(0, '127.0.0.1', resolve);
			});
			const debugPort = probe.address().port;
			await new Promise((resolve) => probe.close(resolve));
			chrome = await chromium.launch({
				executablePath: chromium.executablePath(),
				args: [`--remote-debugging-port=${debugPort}`]
			});
			const result = await lighthouse(
				origin + target.path,
				{
					port: debugPort,
					logLevel: 'error',
					output: ['json', 'html'],
					onlyCategories: Object.keys(thresholds)
				},
				target.desktop ? desktopConfig : undefined
			);
			if (!result || result.lhr.runtimeError)
				throw new Error(`Lighthouse failed for ${target.id}: ${result?.lhr.runtimeError?.message}`);
			const [json, html] = result.report;
			writeFileSync(join(reports, `${target.id}-${run}.json`), json);
			writeFileSync(join(reports, `${target.id}-${run}.html`), html);
			results.push(result.lhr);
			await chrome.close();
			chrome = undefined;
			console.log(
				`${target.id} run ${run}/${runs}: ${Math.round(result.lhr.categories.performance.score * 100)}`
			);
		}
		const scores = Object.fromEntries(
			Object.keys(thresholds).map((category) => [
				category,
				median(results.map((result) => result.categories[category]?.score ?? 0))
			])
		);
		for (const [category, minimum] of Object.entries(floors))
			if (scores[category] < minimum)
				failures.push(
					`${target.id}: ${category} ${Math.round(scores[category] * 100)} < ${minimum * 100}`
				);
		const metrics = Object.fromEntries(
			['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'].map((id) => [
				id,
				median(results.map((result) => result.audits[id].numericValue))
			])
		);
		if (metrics['largest-contentful-paint'] > lcpLimit)
			failures.push(`${target.id}: LCP exceeds ${lcpLimit}ms`);
		if (metrics['cumulative-layout-shift'] > 0.1) failures.push(`${target.id}: CLS exceeds 0.1`);
		for (const result of results) {
			const requests = result.audits['network-requests'].details?.items ?? [];
			if (requests.some((request) => /maplibre|cartocdn\.com|immutable\/workers/.test(request.url)))
				failures.push(`${target.id}: optional map downloaded on a gallery page`);
			const scripts = result.audits['resource-summary'].details?.items?.find(
				(item) => item.resourceType === 'script'
			);
			if (Number(scripts?.transferSize) > 350 * 1024)
				failures.push(`${target.id}: script transfer exceeds 350 KiB`);
		}
		summary.push({ target: target.id, floors, lcpLimit, scores, metrics });
	}
} catch (error) {
	failures.push(error.message);
} finally {
	try {
		await chrome?.close();
	} catch (error) {
		console.warn(`Browser cleanup: ${error.message}`);
	}
	server.kill();
	const markdown = [
		'# Lighthouse budgets',
		`Median of ${runs} cold runs per page. Performance ≥90 desktop / ≥85 slow-4G mobile; accessibility 100; best practices ≥95; SEO 100. LCP ≤2.5s desktop / ≤4s simulated mobile; CLS ≤0.1. These are laboratory regression budgets, not field Core Web Vitals guarantees. Mobile performance ≥90 remains the optimization target.`,
		'',
		'| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |',
		'|---|---:|---:|---:|---:|---:|---:|---:|',
		...summary.map(
			(row) =>
				`| ${row.target} | ${Math.round(row.scores.performance * 100)} | ${Math.round(row.scores.accessibility * 100)} | ${Math.round(row.scores['best-practices'] * 100)} | ${Math.round(row.scores.seo * 100)} | ${Math.round(row.metrics['largest-contentful-paint'])}ms | ${Math.round(row.metrics['total-blocking-time'])}ms | ${row.metrics['cumulative-layout-shift'].toFixed(3)} |`
		),
		'',
		...failures.map((failure) => `- FAIL: ${failure}`),
		'',
		'HTML and JSON reports are retained as a workflow artifact.'
	].join('\n');
	writeFileSync(join(reports, 'summary.md'), markdown);
	writeFileSync(
		join(reports, 'summary.json'),
		JSON.stringify({ runs, thresholds, summary, failures }, null, 2)
	);
	if (process.env.GITHUB_STEP_SUMMARY)
		appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n');
	console.log(markdown);
}
if (failures.length) process.exitCode = 1;
