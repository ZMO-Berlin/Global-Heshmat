#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const port = 4174;
const url = `http://127.0.0.1:${port}/collection/`;
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

async function waitForServer() {
	const deadline = Date.now() + 60_000;
	while (Date.now() < deadline) {
		if (server.exitCode !== null) {
			throw new Error(`Preview server exited (${server.exitCode}): ${serverError.trim()}`);
		}
		try {
			const response = await fetch(url);
			if (response.ok) {
				await new Promise((resolve) => setTimeout(resolve, 50));
				if (server.exitCode === null) return;
			}
		} catch {
			// The preview server is still starting.
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`Preview server did not become ready at ${url}`);
}

let chrome;
try {
	await waitForServer();
	chrome = await launch({
		chromePath: chromium.executablePath(),
		chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
	});
	const result = await lighthouse(
		url,
		{
			port: chrome.port,
			logLevel: 'error',
			output: 'json',
			onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
		},
		desktopConfig
	);
	if (!result) throw new Error('Lighthouse returned no result');

	const thresholds = {
		performance: 0.85,
		accessibility: 0.95,
		'best-practices': 0.9,
		seo: 0.95
	};
	const failures = [];
	for (const [category, minimum] of Object.entries(thresholds)) {
		const score = result.lhr.categories[category]?.score ?? 0;
		console.log(`${category}: ${Math.round(score * 100)}`);
		if (score < minimum) failures.push(`${category} ${score.toFixed(2)} < ${minimum}`);
	}

	for (const id of [
		'first-contentful-paint',
		'largest-contentful-paint',
		'speed-index',
		'total-blocking-time',
		'cumulative-layout-shift'
	]) {
		const audit = result.lhr.audits[id];
		console.log(`${audit.title}: ${audit.displayValue ?? audit.numericValue}`);
	}
	const opportunities = Object.values(result.lhr.audits)
		.filter((audit) => Number(audit.details?.overallSavingsMs) > 0)
		.sort(
			(a, b) => Number(b.details?.overallSavingsMs ?? 0) - Number(a.details?.overallSavingsMs ?? 0)
		)
		.slice(0, 5);
	for (const audit of opportunities) {
		console.log(
			`opportunity: ${audit.title} (${Math.round(Number(audit.details.overallSavingsMs))} ms)`
		);
	}
	const layoutShifts = result.lhr.audits['layout-shifts']?.details?.items ?? [];
	for (const shift of layoutShifts.slice(0, 5)) {
		console.log(
			`layout shift: ${shift.node?.selector ?? shift.node?.snippet ?? 'unknown element'} (${Number(shift.score ?? 0).toFixed(3)})`
		);
	}

	const requests = result.lhr.audits['network-requests'].details?.items ?? [];
	const mapRequests = requests.filter((item) =>
		/maplibre(?:[.-])|cartocdn\.com/.test(String(item.url))
	);
	if (mapRequests.length > 0) failures.push('collection route requested the optional map stack');

	const scripts = result.lhr.audits['resource-summary'].details?.items?.find(
		(item) => item.resourceType === 'script'
	);
	const scriptBytes = Number(scripts?.transferSize ?? 0);
	console.log(`script transfer: ${(scriptBytes / 1024).toFixed(1)} KiB`);
	if (scriptBytes > 350 * 1024) failures.push(`script transfer ${scriptBytes} B exceeds 350 KiB`);

	if (failures.length > 0) {
		throw new Error(`Lighthouse budget failed:\n- ${failures.join('\n- ')}`);
	}
} finally {
	let profileToRemove;
	try {
		await chrome?.kill();
	} catch (error) {
		// chrome-launcher can race a Windows file handle while deleting its
		// temporary profile. At this point it has already closed its log files,
		// so one delayed retry can finish the cleanup cleanly.
		if (error.code === 'EPERM' && typeof error.path === 'string') profileToRemove = error.path;
		else console.warn(`Lighthouse browser cleanup warning: ${error.message}`);
	}
	server.kill();
	if (profileToRemove) {
		await new Promise((resolve) => setTimeout(resolve, 250));
		try {
			rmSync(profileToRemove, { recursive: true, force: true, maxRetries: 10 });
		} catch (error) {
			// A Windows scanner can retain a handle past the browser process. The
			// profile lives in the OS temp directory and is safe for normal temp
			// cleanup; surface only unexpected cleanup failures.
			if (error.code !== 'EPERM') {
				console.warn(`Lighthouse profile cleanup warning: ${error.message}`);
			}
		}
	}
}
