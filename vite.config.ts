import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
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
		server: {
			deps: {
				inline: [/@auth\/sveltekit/]
			}
		},
		pool: 'threads'
	},
	resolve: {
		alias: {
			'$lib': path.resolve(__dirname, './src/lib')
		},
		conditions: process.env.VITEST ? ['browser'] : undefined
	}
});
