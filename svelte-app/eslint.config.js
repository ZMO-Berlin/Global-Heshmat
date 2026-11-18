import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__BUILD_ID__: 'readonly',
				__REVISION__: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		// Internal links are built by src/lib/utils/browse-hrefs.ts (through the
		// browse store) and resolve(); the rule cannot follow a href through those
		// builders, and has no option to accept them. scripts/verify-build.mjs and
		// the e2e suite check the built links instead.
		files: ['**/*.svelte', '**/*.svelte.ts'],
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'.npm-cache/',
			'.lighthouse/',
			'coverage/',
			'test-results/',
			'playwright-report/',
			'.impeccable/'
		]
	}
);
