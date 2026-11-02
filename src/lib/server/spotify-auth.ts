import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
/** Refresh a little before Spotify considers the token dead. */
const EXPIRY_MARGIN_MS = 60_000;

type SpotifyTokenResponse = {
	access_token?: string;
	expires_in?: number;
	error?: string;
	error_description?: string;
};

let appToken: { accessToken: string; expiresAt: number } | null = null;
let appTokenRequest: Promise<string> | null = null;

/**
 * Spotify access is app-only. Cadence never asks users to connect a Spotify
 * account, so the Client Credentials token is all it needs for song search.
 *
 * The token is cached per Worker isolate until shortly before it expires.
 */
export async function getAppAccessToken(): Promise<string> {
	if (appToken && appToken.expiresAt > Date.now() + EXPIRY_MARGIN_MS) {
		return appToken.accessToken;
	}

	// Collapse concurrent requests inside the same isolate into one call.
	appTokenRequest ??= fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: SPOTIFY_CLIENT_ID,
			client_secret: SPOTIFY_CLIENT_SECRET
		})
	})
		.then(async (response) => {
			const data = (await response.json().catch(() => ({}))) as SpotifyTokenResponse;

			if (!response.ok || !data.access_token) {
				throw new Error(
					`Spotify token request failed (${response.status}): ${data.error_description ?? data.error ?? 'unknown error'}`
				);
			}

			appToken = {
				accessToken: data.access_token,
				expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
			};

			return appToken.accessToken;
		})
		.finally(() => {
			appTokenRequest = null;
		});

	return appTokenRequest;
}
