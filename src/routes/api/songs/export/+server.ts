import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { eq, and, like, asc } from 'drizzle-orm';
import { z } from 'zod';
import { hasScopes, REQUIRED_EXPORT_SCOPES } from '$lib/server/spotify';

const exportSchema = z.object({
	exportType: z.enum(['monthly', 'yearly', 'all']),
	year: z.number().int().min(2000).max(2100).optional(),
	month: z.number().int().min(0).max(11).optional()
});

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const TRACKS_PER_REQUEST = 100;

interface SpotifyPlaylist {
	id: string;
	external_urls: {
		spotify: string;
	};
}

function getPlaylistName(exportType: string, year?: number, month?: number): string {
	const now = new Date();
	const y = year ?? now.getFullYear();

	if (exportType === 'monthly' && month !== undefined) {
		const monthName = new Date(y, month, 1).toLocaleString('en-US', { month: 'long' });
		return `Cadence - ${monthName} ${y}`;
	}

	if (exportType === 'yearly') {
		return `Cadence - ${y}`;
	}

	return 'Cadence - All Time';
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	const accessToken = session?.accessToken;
	const scope = session?.scope;

	if (!session?.user?.id || !accessToken) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	// The token must have been granted the playlist-modify-private scope.
	// Sessions created before the scope was requested won't have it, even
	// though their access token may still be valid, so we ask the user to
	// reconnect (which forces a fresh Spotify consent screen).
	if (!hasScopes(scope, REQUIRED_EXPORT_SCOPES)) {
		return json(
			{
				error: 'Missing permission to create playlists. Please reconnect your Spotify account.',
				code: 'SCOPE_MISSING'
			},
			{ status: 403 }
		);
	}

	const body = await request.json();
	const result = exportSchema.safeParse(body);

	if (!result.success) {
		return json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
	}

	const { exportType, year, month } = result.data;

	if ((exportType === 'monthly' || exportType === 'yearly') && year === undefined) {
		return json({ error: 'Year is required for monthly and yearly exports' }, { status: 400 });
	}

	if (exportType === 'monthly' && month === undefined) {
		return json({ error: 'Month is required for monthly exports' }, { status: 400 });
	}

	try {
		const authHeader = { Authorization: `Bearer ${accessToken}` };

		// 1. Fetch the requested songs from the database
		const conditions = [eq(dailySongs.userId, session.user.id)];

		if (exportType === 'monthly') {
			const pattern = `${year}-${String(month! + 1).padStart(2, '0')}-%`;
			conditions.push(like(dailySongs.dateKey, pattern));
		} else if (exportType === 'yearly') {
			const pattern = `${year}-%`;
			conditions.push(like(dailySongs.dateKey, pattern));
		}

		const results = await db
			.select({
				dateKey: dailySongs.dateKey,
				songId: songs.id
			})
			.from(dailySongs)
			.innerJoin(songs, eq(dailySongs.songId, songs.id))
			.where(and(...conditions))
			.orderBy(asc(dailySongs.dateKey));

		if (results.length === 0) {
			return json({ error: 'No songs found for the selected period' }, { status: 400 });
		}

		// 2. Create the playlist for the current user
		const playlistName = getPlaylistName(exportType, year, month);
		const createRes = await fetch(`${SPOTIFY_API_BASE}/me/playlists`, {
			method: 'POST',
			headers: {
				...authHeader,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: playlistName,
				description: 'Exported from Cadence (https://github.com/franpts2/cadence)',
				public: false
			})
		});

		if (!createRes.ok) {
			const errorData = await createRes.json().catch(() => ({}));
			console.error('[Export] Create playlist error:', createRes.status, errorData);

			if (createRes.status === 401 || createRes.status === 403) {
				return json(
					{
						error: 'Missing permission to create playlists. Please reconnect your Spotify account.',
						code: 'SCOPE_MISSING'
					},
					{ status: 403 }
				);
			}

			return json(
				{ error: errorData.error?.message || 'Failed to create Spotify playlist' },
				{ status: createRes.status }
			);
		}

		const playlist: SpotifyPlaylist = await createRes.json();

		// 3. Add tracks in batches
		const trackUris = results.map((r) => `spotify:track:${r.songId}`);
		let added = 0;

		for (let i = 0; i < trackUris.length; i += TRACKS_PER_REQUEST) {
			const batch = trackUris.slice(i, i + TRACKS_PER_REQUEST);

			const addRes = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/items`, {
				method: 'POST',
				headers: {
					...authHeader,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ uris: batch })
			});

			if (!addRes.ok) {
				const errorData = await addRes.json().catch(() => ({}));
				console.error('[Export] Add tracks error:', addRes.status, errorData);
				return json(
					{
						error: `Playlist created, but failed to add some tracks: ${errorData.error?.message || 'Unknown error'}`,
						playlistUrl: playlist.external_urls.spotify,
						added,
						total: trackUris.length
					},
					{ status: 500 }
				);
			}

			added += batch.length;
		}

		return json({
			success: true,
			playlistUrl: playlist.external_urls.spotify,
			playlistName,
			count: added
		});
	} catch (err) {
		console.error('[Export] Fatal internal error:', err);
		return json({ error: 'Internal server error during export' }, { status: 500 });
	}
};
