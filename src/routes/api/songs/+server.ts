import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { eq, and, like } from 'drizzle-orm';
import { SongSchema } from '$lib';
import { z } from 'zod';

const postSchema = z.object({
	dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	song: SongSchema
});

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id || (session as any)?.error === 'RefreshAccessTokenError') {
		return json({ error: 'Unauthorized', code: 'AUTH_EXPIRED' }, { status: 401 });
	}

	const year = url.searchParams.get('year');
	const month = url.searchParams.get('month');

	try {
		let conditions = [eq(dailySongs.userId, session.user.id)];
		
		if (year && month) {
			const pattern = `${year}-${month.padStart(2, '0')}-%`;
			conditions.push(like(dailySongs.dateKey, pattern));
		}

		const results = await db
			.select({
				dateKey: dailySongs.dateKey,
				songId: songs.id,
				songName: songs.name,
				artistName: songs.artistName,
				albumName: songs.albumName,
				albumImageUrl: songs.albumImageUrl,
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
	if (!session?.user?.id || (session as any)?.error === 'RefreshAccessTokenError') {
		return json({ error: 'Unauthorized', code: 'AUTH_EXPIRED' }, { status: 401 });
	}

	const body = await request.json();
	const result = postSchema.safeParse(body);

	if (!result.success) {
		return json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
	}

	const { dateKey, song } = result.data;

	try {
		await db.insert(songs).values({
			id: song.id,
			name: song.name,
			artistName: song.artists.map((a) => a.name).join(', '),
			albumName: song.album.name,
			albumImageUrl: song.album.images[0]?.url ?? null,
		}).onConflictDoUpdate({
			target: songs.id,
			set: {
				name: song.name,
				artistName: song.artists.map((a) => a.name).join(', '),
				albumName: song.album.name,
				albumImageUrl: song.album.images[0]?.url ?? null,
				updatedAt: new Date()
			}
		});

		await db.insert(dailySongs).values({
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
	if (!session?.user?.id || (session as any)?.error === 'RefreshAccessTokenError') {
		return json({ error: 'Unauthorized', code: 'AUTH_EXPIRED' }, { status: 401 });
	}

	const dateKey = url.searchParams.get('dateKey');
	if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
		return json({ error: 'Missing or invalid dateKey' }, { status: 400 });
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

export const PATCH: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id || (session as any)?.error === 'RefreshAccessTokenError') {
		return json({ error: 'Unauthorized', code: 'AUTH_EXPIRED' }, { status: 401 });
	}

	const { fromKey, toKey } = await request.json();

	if (!fromKey || !toKey) {
		return json({ error: 'Missing fromKey or toKey' }, { status: 400 });
	}

	const userId = session.user.id;

	try {
		await db.transaction(async (tx) => {
			// Get the song from the original date
			const existing = await tx
				.select()
				.from(dailySongs)
				.where(
					and(
						eq(dailySongs.userId, userId),
						eq(dailySongs.dateKey, fromKey)
					)
				)
				.get();

			if (!existing) {
				throw new Error('No song found at original date');
			}

			// Delete any song at the target date (to avoid unique constraint violation)
			await tx
				.delete(dailySongs)
				.where(
					and(
						eq(dailySongs.userId, userId),
						eq(dailySongs.dateKey, toKey)
					)
				);

			// Update the dateKey
			await tx
				.update(dailySongs)
				.set({ dateKey: toKey })
				.where(eq(dailySongs.id, existing.id));
		});

		return json({ success: true });
	} catch (err) {
		console.error('Failed to move song:', err);
		return json({ error: 'Database error' }, { status: 500 });
	}
};
