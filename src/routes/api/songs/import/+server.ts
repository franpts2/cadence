import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { dailySongs, songs } from '$lib/server/db/schema';
import { getDaysInMonth, getDateKey } from '$lib/utils/date';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	const accessToken = (session as any)?.accessToken;
	const sessionError = (session as any)?.error;

	if (!session?.user?.id || !accessToken || sessionError === 'RefreshAccessTokenError') {
		return json({ 
			error: 'Your Spotify session has expired or was revoked. Please log in again.',
			code: 'AUTH_EXPIRED' 
		}, { status: 401 });
	}

	const { playlistUrl, importType, year, month } = await request.json();

	// 1. Robust Playlist ID Extraction
	const idRegex = /(?:playlist[:\/])([a-zA-Z0-9]{22})/;
	const playlistIdMatch = playlistUrl.match(idRegex);
	
	if (!playlistIdMatch) {
		console.error('[Import] Failed to parse ID from URL:', playlistUrl);
		return json({ error: 'Invalid Spotify playlist URL. Please ensure it is a valid playlist link.' }, { status: 400 });
	}
	const playlistId = playlistIdMatch[1];

	console.log(`[Import] Processing playlist: ${playlistId} for user ${session.user.id}`);

	try {
		const authHeader = { Authorization: `Bearer ${accessToken}` };

		// 2. Verify token and get user identity
		const meRes = await fetch('https://api.spotify.com/v1/me', { headers: authHeader });
		if (!meRes.ok) {
			const meError = await meRes.json();
			console.error('[Import] Auth check failed:', meError);
			return json({ 
				error: `Spotify Auth Failed: ${meError.error?.message}. Verify your account is whitelisted in the dashboard.` 
			}, { status: meRes.status });
		}
		const meData = await meRes.json();
		console.log(`[Import] Authenticated as: ${meData.email} (${meData.id})`);

		// 3. Fetch Playlist Metadata
		console.log(`[Import] Fetching metadata for playlist: ${playlistId}`);
		
		const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
			headers: authHeader
		});

		if (!playlistRes.ok) {
			const errorData = await playlistRes.json();
			console.error('[Import] Metadata fetch failed:', { status: playlistRes.status, errorData });
			return json({ error: `Spotify Error: ${errorData.error?.message}` }, { status: playlistRes.status });
		}

		const playlistData = await playlistRes.json();
		
		let rawItems = [];
		if (playlistData.tracks?.items && Array.isArray(playlistData.tracks.items)) {
			rawItems = playlistData.tracks.items;
		} else if (playlistData.items) {
			if (Array.isArray(playlistData.items)) {
				rawItems = playlistData.items;
			} else if (playlistData.items.items && Array.isArray(playlistData.items.items)) {
				rawItems = playlistData.items.items;
			}
		}

		if (rawItems.length > 0) {
			console.log(`[Import] Inspecting first of ${rawItems.length} items...`);
			const sample = rawItems[0];
			console.log(`[Import] Sample Item Keys: ${Object.keys(sample).join(', ')}`);
			if (sample.track) {
				console.log(`[Import] Sample Item Name (via .track): ${sample.track.name}`);
			} else if (sample.item) {
				console.log(`[Import] Sample Item Name (via .item): ${sample.item.name}`);
			} else if (sample.name) {
				console.log(`[Import] Sample Item Name (direct): ${sample.name}`);
			}
		}

		// Robust track extraction
		let tracks = rawItems.map((item: any) => {
			if (item?.track) return item.track;
			if (item?.item) return item.item; // Fix: Look for .item property
			if (item?.name && item?.id) return item; // Item might already be a track object
			return null;
		}).filter(Boolean);

		// Fallback: Only if we still have nothing
		if (tracks.length === 0) {
			console.log('[Import] Tracks still missing. Attempting dedicated tracks endpoint...');
			const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
				headers: authHeader
			});
			if (tracksRes.ok) {
				const tracksData = await tracksRes.json();
				if (tracksData && Array.isArray(tracksData.items)) {
					tracks = tracksData.items.map((item: any) => item?.track || item?.item || item).filter(Boolean);
				}
			}
		}

		console.log('--- Playlist Import Debug ---');
		console.log(`Playlist Name: ${playlistData.name}`);
		console.log(`Total Tracks Found: ${tracks.length}`);
		
		console.log('First 5 songs:');
		tracks.slice(0, 5).forEach((t: any, i: number) => {
			const artists = t.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
			console.log(`  ${i + 1}. ${t.name} by ${artists}`);
		});
		console.log('-----------------------------');

		return json({
			success: true,
			message: `Logged playlist "${playlistData.name}" with ${tracks.length} tracks to console.`,
			debug: {
				name: playlistData.name,
				trackCount: tracks.length,
				firstSongs: tracks.slice(0, 5).map((t: any) => t?.name || 'Unknown')
			}
		});

	} catch (err) {
		console.error('[Import] Fatal internal error:', err);
		return json({ error: 'Internal server error during import' }, { status: 500 });
	}
};
