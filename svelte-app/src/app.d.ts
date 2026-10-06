/// <reference types="vite-plugin-pwa/vanillajs" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	const __BUILD_ID__: string;
	const __REVISION__: string;
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Set by the People routes' layout for the "Place mentioned" facet. */
			peoplePlaces?: string[];
		}
		interface PageState {
			browseSearch?: string;
			browseModal?: { key: 'photo' | 'about'; session: string };
		}
		// interface Platform {}
	}
}

export {};
