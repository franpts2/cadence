import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	server: {
		host: '127.0.0.1'
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		},
		conditions: process.env.VITEST ? ['browser'] : undefined
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		server: {
			deps: {
				inline: [/@auth\/sveltekit/]
			}
		},
		// Run all test files in a single worker (Vitest 4 replacement for `threads.singleThread`).
		maxWorkers: 1
	}
});
