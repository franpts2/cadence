import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	const accessToken = (session as any)?.accessToken;

	if (!session?.user?.id || !accessToken) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const { playlistUrl } = await request.json();

	// 1. Extract Playlist ID
	const idRegex = /(?:playlist[:\/])([a-zA-Z0-9]{22})/;
	const playlistIdMatch = playlistUrl.match(idRegex);
	
	if (!playlistIdMatch) {
		return json({ error: 'Invalid Spotify playlist URL' }, { status: 400 });
	}
	const playlistId = playlistIdMatch[1];

	try {
		const authHeader = { Authorization: `Bearer ${accessToken}` };

		// 2. Fetch Playlist
		const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
			headers: authHeader
		});

		if (!playlistRes.ok) {
			const errorData = await playlistRes.json();
			console.error('[Import] Spotify Error:', errorData);
			return json({ error: errorData.error?.message || 'Spotify Error' }, { status: playlistRes.status });
		}

		const playlistData = await playlistRes.json();
		
		// 3. Robustly extract tracks from various possible Spotify response structures
		let rawItems = [];
		if (playlistData.tracks?.items) rawItems = playlistData.tracks.items;
		else if (playlistData.items?.items) rawItems = playlistData.items.items;
		else if (Array.isArray(playlistData.items)) rawItems = playlistData.items;

		const tracks = rawItems.map((item: any) => {
			const t = item?.track || item?.item || (item?.name ? item : null);
			return t;
		}).filter(Boolean);

		// 4. Log to Console
		console.log('\n--- Playlist Import ---');
		console.log(`Playlist Name: ${playlistData.name}`);
		console.log(`Total Tracks:  ${tracks.length}`);
		console.log('Songs:');
		tracks.slice(0, 5).forEach((t: any, i: number) => {
			const artists = t.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
			console.log(`  ${i + 1}. ${t.name} by ${artists}`);
		});
		console.log('-----------------------\n');

		return json({
			success: true,
			message: `Logged "${playlistData.name}" (${tracks.length} songs) to console.`,
			playlistName: playlistData.name,
			count: tracks.length
		});

	} catch (err) {
		console.error('[Import] Fatal error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
