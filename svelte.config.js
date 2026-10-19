import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Deploys to Cloudflare Pages. Build output goes to .svelte-kit/cloudflare,
		// which is the directory configured on the Pages project.
		adapter: adapter()
	}
};

export default config;
