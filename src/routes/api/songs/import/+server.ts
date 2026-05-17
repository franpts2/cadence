import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { getDaysInMonth, getDateKey } from '$lib/utils/date';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	const accessToken = (session as any)?.accessToken;

	if (!session?.user?.id || !accessToken) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const { playlistUrl, importType, year, month } = await request.json();

	// 1. Extract Playlist ID
	const idRegex = /(?:playlist[:\/])([a-zA-Z0-9]{22})/;
	const playlistIdMatch = playlistUrl.match(idRegex);
	
	if (!playlistIdMatch) {
		return json({ error: 'Invalid Spotify playlist URL' }, { status: 400 });
	}
	const playlistId = playlistIdMatch[1];

	console.log(`[Import] Processing playlist: ${playlistId} for user ${session.user.id}`);

	try {
		const authHeader = { Authorization: `Bearer ${accessToken}` };

		// 2. Fetch Playlist Metadata
		const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
			headers: authHeader
		});

		if (!playlistRes.ok) {
			const errorData = await playlistRes.json();
			console.error('[Import] Spotify Error:', errorData);
			return json({ error: errorData.error?.message || 'Spotify Error' }, { status: playlistRes.status });
		}

		const playlistData = await playlistRes.json();
		
		// 3. Robust track extraction (using the fix we discovered)
		let rawItems = [];
		if (playlistData.tracks?.items) rawItems = playlistData.tracks.items;
		else if (playlistData.items?.items) rawItems = playlistData.items.items;
		else if (Array.isArray(playlistData.items)) rawItems = playlistData.items;

		const tracks = rawItems.map((item: any) => {
			const t = item?.track || item?.item || (item?.name ? item : null);
			return t;
		}).filter(Boolean);

		if (tracks.length === 0) {
			return json({ error: 'Playlist is empty or tracks could not be read.' }, { status: 400 });
		}

		console.log(`[Import] Successfully extracted ${tracks.length} tracks from "${playlistData.name}"`);

		// 4. Determine Date Range
		const entries: { userId: string; dateKey: string; songId: string }[] = [];
		const uniqueSongs = new Map();

		let maxDays = 0;
		let startDate: Date;

		if (importType === 'monthly') {
			maxDays = getDaysInMonth(year, month);
			startDate = new Date(year, month, 1);
		} else {
			maxDays = 0;
			for (let m = 0; m < 12; m++) {
				maxDays += getDaysInMonth(year, m);
			}
			startDate = new Date(year, 0, 1);
		}

		const songsToImportCount = Math.min(tracks.length, maxDays);
		const skippedCount = tracks.length > maxDays ? tracks.length - maxDays : 0;

		for (let i = 0; i < songsToImportCount; i++) {
			const track = tracks[i];
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);
			const dateKey = getDateKey(currentDate);

			uniqueSongs.set(track.id, {
				id: track.id,
				name: track.name,
				artistName: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
				albumName: track.album?.name || 'Unknown Album',
				albumImageUrl: track.album?.images?.[0]?.url ?? null,
				updatedAt: new Date()
			});

			entries.push({
				userId: session.user.id,
				dateKey,
				songId: track.id
			});
		}

		// 5. Database Operations
		await db.transaction(async (tx) => {
			const songValues = Array.from(uniqueSongs.values());
			if (songValues.length > 0) {
				await tx.insert(songs).values(songValues).onConflictDoUpdate({
					target: songs.id,
					set: {
						name: sql`excluded.name`,
						artistName: sql`excluded.artist_name`,
						albumName: sql`excluded.album_name`,
						albumImageUrl: sql`excluded.album_image_url`,
						updatedAt: new Date()
					}
				});
			}

			if (entries.length > 0) {
				await tx.insert(dailySongs).values(entries).onConflictDoUpdate({
					target: [dailySongs.userId, dailySongs.dateKey],
					set: {
						songId: sql`excluded.song_id`
					}
				});
			}
		});

		console.log(`[Import] Saved ${songsToImportCount} songs to database for user ${session.user.id}`);

		return json({
			success: true,
			count: songsToImportCount,
			skipped: skippedCount,
			period: importType === 'monthly' ? 'month' : 'year'
		});

	} catch (err) {
		console.error('[Import] Fatal internal error:', err);
		return json({ error: 'Internal server error during import' }, { status: 500 });
	}
};
