import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	server: {
		host: '127.0.0.1'
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		alias: {
			'$lib': './src/lib'
		},
		server: {
			deps: {
				inline: [/@auth\/sveltekit/]
			}
		},
		threads: {
			singleThread: true
		}
	},
	resolve: {
		conditions: process.env.VITEST ? ['browser'] : undefined
	}
});
