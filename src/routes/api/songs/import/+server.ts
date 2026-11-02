import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { getDaysInMonth, getDateKey } from '$lib/utils/date';
import { sql } from 'drizzle-orm';
import { getSpotifyUserToken } from '$lib/server/spotify-auth';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const ITEMS_PER_PAGE = 100;

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();

	if (!session?.user?.id) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	// Spotify requires user authentication to read playlist tracks: the
	// app-only (Client Credentials) token gets a 401 from /playlists/{id}/items.
	const accessToken = await getSpotifyUserToken(session.user.id);

	if (!accessToken) {
		return json(
			{
				error: 'Connect your Spotify account to import playlists.',
				code: 'SPOTIFY_NOT_CONNECTED'
			},
			{ status: 403 }
		);
	}

	const { playlistUrl, importType, year, month } = await request.json();

	// 1. Extract Playlist ID
	const idRegex = /(?:playlist[:\/])([a-zA-Z0-9]{22})/;
	const playlistIdMatch = playlistUrl.match(idRegex);
	
	if (!playlistIdMatch) {
		return json({ error: 'Invalid Spotify playlist URL' }, { status: 400 });
	}
	const playlistId = playlistIdMatch[1];

	try {
		const authHeader = { Authorization: `Bearer ${accessToken}` };

		// 2. Read the playlist's items, following Spotify's pagination.
		//    Spotify removed the embedded tracks from the playlist object and
		//    deprecated /tracks; /items is the current endpoint.
		let nextUrl: string | null = `${SPOTIFY_API_BASE}/playlists/${playlistId}/items?limit=${ITEMS_PER_PAGE}`;
		const rawItems: any[] = [];
		const visitedUrls = new Set<string>();

		while (nextUrl && !visitedUrls.has(nextUrl)) {
			visitedUrls.add(nextUrl);

			const pageRes: Response = await fetch(nextUrl, { headers: authHeader });

			if (!pageRes.ok) {
				const errorData = await pageRes.json().catch(() => ({}));
				console.error('[Import] Spotify error:', pageRes.status, errorData);

				if (pageRes.status === 404) {
					return json(
						{ error: 'Playlist not found. If it is private, connect Spotify first.' },
						{ status: 404 }
					);
				}

				return json(
					{ error: errorData.error?.message || 'Failed to read playlist tracks' },
					{ status: pageRes.status }
				);
			}

			const page: { items?: any[]; next?: string | null } = await pageRes.json();
			rawItems.push(...(page.items ?? []));
			nextUrl = page.next ?? null;
		}

		const tracks = rawItems.map((item: any) => {
			const t = item?.item || item?.track || (item?.name ? item : null);
			return t;
		}).filter(Boolean);

		if (tracks.length === 0) {
			return json({ error: 'Playlist is empty or tracks could not be read.' }, { status: 400 });
		}

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
