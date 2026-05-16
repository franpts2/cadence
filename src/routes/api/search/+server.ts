import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.auth();
  
  if (!session || !session.accessToken) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = url.searchParams.get('q');
  if (!query) {
    return json([]);
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: { 
        Authorization: `Bearer ${session.accessToken}` 
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: 'Spotify API error', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    // Return only the items array for simplicity
    return json(data.tracks?.items || []);
  } catch (err) {
    console.error('Search error:', err);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
