import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { dailySongs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	
	if (!session?.user?.id) {
		return {
			songs: []
		};
	}

	try {
		const songs = await db
			.select()
			.from(dailySongs)
			.where(eq(dailySongs.userId, session.user.id));
		
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
