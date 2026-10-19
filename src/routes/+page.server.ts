import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	// Signed-in users have no reason to see the landing page.
	if (session?.user) {
		redirect(303, '/calendar');
	}

	return {};
};
