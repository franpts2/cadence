import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { eq, and, like } from 'drizzle-orm';
import type { Song } from '$lib';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const year = url.searchParams.get('year');
	const month = url.searchParams.get('month');

	try {
		let conditions = [eq(dailySongs.userId, session.user.id)];
		
		if (year && month) {
			const pattern = `${year}-${month.padStart(2, '0')}-%`;
			conditions.push(like(dailySongs.dateKey, pattern));
		}

		// Use a JOIN to get normalized song data
		const results = await db
			.select({
				dateKey: dailySongs.dateKey,
				songId: songs.id,
				songName: songs.name,
				artistName: songs.artistName,
				albumName: songs.albumName,
				albumImageUrl: songs.albumImageUrl,
				previewUrl: songs.previewUrl,
			})
			.from(dailySongs)
			.innerJoin(songs, eq(dailySongs.songId, songs.id))
			.where(and(...conditions));
		
		return json(results);
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

	const { dateKey, song }: { dateKey: string, song: Song } = await request.json();

	try {
		// 1. Ensure the song exists in the normalized 'songs' table
		await db.insert(songs).values({
			id: song.id,
			name: song.name,
			artistName: song.artists.map((a) => a.name).join(', '),
			albumName: song.album.name,
			albumImageUrl: song.album.images[0]?.url ?? null,
			previewUrl: (song as any).preview_url ?? null,
		}).onConflictDoUpdate({
			target: songs.id,
			set: {
				name: song.name,
				artistName: song.artists.map((a) => a.name).join(', '),
				albumName: song.album.name,
				albumImageUrl: song.album.images[0]?.url ?? null,
				previewUrl: (song as any).preview_url ?? null,
				updatedAt: new Date()
			}
		});

		// 2. Link the song to the user and date in 'dailySongs'
		const entryId = crypto.randomUUID();
		await db.insert(dailySongs).values({
			id: entryId,
			userId: session.user.id,
			dateKey,
			songId: song.id,
		}).onConflictDoUpdate({
			target: [dailySongs.userId, dailySongs.dateKey],
			set: {
				songId: song.id
			}
		});
		
		return json({ success: true });
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
