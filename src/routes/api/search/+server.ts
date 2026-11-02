import { json, type RequestHandler } from '@sveltejs/kit';
import { getCatalogueToken } from '$lib/server/spotify-auth';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();

	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const query = url.searchParams.get('q');
	if (!query) {
		return json([]);
	}

	let accessToken: string;
	try {
		// Users who connected Spotify search with their own token; everyone else
		// uses the app-only token, which has no per-user restriction.
		accessToken = await getCatalogueToken(session.user.id);
	} catch (err) {
		console.error('Could not get a Spotify token:', err);
		return json({ error: 'Spotify search is unavailable right now' }, { status: 503 });
	}

	try {
		const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
			headers: { 
				Authorization: `Bearer ${accessToken}` 
			}
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Spotify API error:', errorData);
			return json({ error: 'Spotify API error', details: errorData }, { status: response.status });
		}

		const data = await response.json();
		return json(data.tracks?.items || []);
	} catch (err) {
		console.error('Search error:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
