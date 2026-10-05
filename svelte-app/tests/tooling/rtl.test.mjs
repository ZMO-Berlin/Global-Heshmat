import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
test('development serves the same local RTL shaping asset as production', async () => {
	const server = await createServer({
		mode: 'test',
		server: { host: '127.0.0.1', port: 0 },
		logLevel: 'error'
	});
	try {
		await server.listen();
		const response = await fetch(
			`http://127.0.0.1:${server.httpServer.address().port}/rtl-text-plugin.js`
		);
		assert.equal(response.status, 200);
		assert.match(response.headers.get('content-type'), /javascript/);
		assert.ok((await response.text()).length > 1000);
	} finally {
		await server.close();
	}
});
