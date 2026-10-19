import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailySongs } from '$lib/server/db/schema';
import { eq, and, like } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	// The journal is private: send anonymous visitors back to the landing.
	if (!session?.user?.id) {
		redirect(303, '/');
	}

	try {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const pattern = `${year}-${month}-%`;

		const songs = await db
			.select()
			.from(dailySongs)
			.where(
				and(
					eq(dailySongs.userId, session.user.id),
					like(dailySongs.dateKey, pattern)
				)
			);

		return {
			songs
		};
	} catch (err) {
		console.error('Failed to load songs in page server:', err);
		return {
			songs: []
		};
	}
};
