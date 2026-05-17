import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	const accessToken = (session as any)?.accessToken;
	const sessionError = (session as any)?.error;
	
	if (!session || !accessToken || sessionError === 'RefreshAccessTokenError') {
		return json({ error: 'Spotify session expired. Please log in again.', code: 'AUTH_EXPIRED' }, { status: 401 });
	}

	const query = url.searchParams.get('q');
	if (!query) {
		return json([]);
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
