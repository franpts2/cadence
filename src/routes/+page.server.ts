import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailySongs } from '$lib/server/db/schema';
import { eq, and, like } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	
	if (!session?.user?.id) {
		return {
			songs: []
		};
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
