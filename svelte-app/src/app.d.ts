/// <reference types="vite-plugin-pwa/vanillajs" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			browseSearch?: string;
		}
		// interface Platform {}
	}
}

export {};
