import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
// MapView imports the plugin with ?url: production emits it with a content hash
// (verify-build checks); development must serve the same file at the URL it gives.
test('development serves the local RTL shaping asset that MapView imports', async () => {
	const server = await createServer({
		mode: 'test',
		server: { host: '127.0.0.1', port: 0 },
		logLevel: 'error'
	});
	try {
		await server.listen();
		const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
		const { default: url } = await server.ssrLoadModule('$rtl-text-plugin?url');
		const response = await fetch(new URL(url, origin));
		assert.equal(response.status, 200);
		assert.match(response.headers.get('content-type'), /javascript/);
		assert.ok((await response.text()).length > 1000);
	} finally {
		await server.close();
	}
});
