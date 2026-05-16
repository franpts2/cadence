import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const songs = await db
			.select()
			.from(dailySongs)
			.where(eq(dailySongs.userId, session.user.id));
		
		return json(songs);
	} catch (err) {
		console.error('Failed to fetch songs:', err);
		return json({ error: 'Database error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { dateKey, song } = await request.json();

	try {
		const id = crypto.randomUUID();
		const newSong = {
			id,
			userId: session.user.id,
			dateKey,
			songId: song.id,
			songName: song.name,
			artistName: song.artists.map((a: any) => a.name).join(', '),
			albumName: song.album.name,
			albumImageUrl: song.album.images[0]?.url,
			previewUrl: song.preview_url,
		};

		await db.insert(dailySongs).values(newSong);
		return json(newSong);
	} catch (err) {
		console.error('Failed to save song:', err);
		return json({ error: 'Database error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const dateKey = url.searchParams.get('dateKey');
	if (!dateKey) {
		return json({ error: 'Missing dateKey' }, { status: 400 });
	}

	try {
		await db
			.delete(dailySongs)
			.where(
				and(
					eq(dailySongs.userId, session.user.id),
					eq(dailySongs.dateKey, dateKey)
				)
			);
		
		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete song:', err);
		return json({ error: 'Database error' }, { status: 500 });
	}
};
