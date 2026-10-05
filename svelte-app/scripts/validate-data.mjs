import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
	const { editorialReport } = await server.ssrLoadModule('/src/lib/editorial/report.ts');
	const report = editorialReport();
	const destination = process.argv.indexOf('--report');
	if (destination !== -1) {
		if (!process.argv[destination + 1]) throw new Error('--report requires a filename');
		await writeFile(process.argv[destination + 1], JSON.stringify(report, null, 2) + '\n');
	}
	console.log(
		`Editorial validation: ${report.records} records, ${report.errors.length} errors, ${report.warnings.length} research warnings.`
	);
	for (const error of report.errors) console.error(`${error.record}: ${error.message}`);
	if (report.errors.length) process.exitCode = 1;
} finally {
	await server.close();
}
