import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
/** Refresh a little before Spotify considers the token dead. */
const EXPIRY_MARGIN_MS = 60_000;

type SpotifyTokenResponse = {
	access_token?: string;
	expires_in?: number;
	refresh_token?: string;
	scope?: string;
	error?: string;
	error_description?: string;
};

/**
 * Cadence no longer signs users in with Spotify. Identity comes from Google and
 * Spotify is an optional connection that unlocks private playlists and export.
 *
 * Catalogue reads (search, public playlists) work with an app-only token, which
 * has no per-user allowlist, so the app works for everyone. Spotify access
 * tokens for a specific user live in the `account` table, written when they use
 * "Connect Spotify".
 */

let appToken: { accessToken: string; expiresAt: number } | null = null;
let appTokenRequest: Promise<string> | null = null;

async function requestToken(body: URLSearchParams): Promise<SpotifyTokenResponse> {
	const response = await fetch(TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	const data = (await response.json().catch(() => ({}))) as SpotifyTokenResponse;

	if (!response.ok || !data.access_token) {
		throw new Error(
			`Spotify token request failed (${response.status}): ${data.error_description ?? data.error ?? 'unknown error'}`
		);
	}

	return data;
}

/** App-only token used for catalogue reads when the user has not connected Spotify. */
export async function getAppAccessToken(): Promise<string> {
	if (appToken && appToken.expiresAt > Date.now() + EXPIRY_MARGIN_MS) {
		return appToken.accessToken;
	}

	// Collapse concurrent requests inside the same isolate into one call.
	appTokenRequest ??= requestToken(
		new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: SPOTIFY_CLIENT_ID,
			client_secret: SPOTIFY_CLIENT_SECRET
		})
	)
		.then((data) => {
			appToken = {
				accessToken: data.access_token!,
				expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
			};
			return appToken.accessToken;
		})
		.finally(() => {
			appTokenRequest = null;
		});

	return appTokenRequest;
}

/** The Spotify connection linked to a Cadence user, if any. */
export async function getSpotifyAccount(userId: string) {
	const rows = await db
		.select()
		.from(accounts)
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, 'spotify')))
		.limit(1);

	return rows[0] ?? null;
}

/**
 * Returns a valid Spotify access token for the user's own connection, refreshing
 * it in place when it is about to expire. Returns null when Spotify is not
 * connected.
 */
export async function getSpotifyUserToken(userId: string): Promise<string | null> {
	const account = await getSpotifyAccount(userId);
	if (!account?.access_token) return null;

	const expiresAt = (account.expires_at ?? 0) * 1000;
	if (expiresAt > Date.now() + EXPIRY_MARGIN_MS) {
		return account.access_token;
	}

	if (!account.refresh_token) return account.access_token;

	try {
		const data = await requestToken(
			new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: account.refresh_token,
				client_id: SPOTIFY_CLIENT_ID,
				client_secret: SPOTIFY_CLIENT_SECRET
			})
		);

		await db
			.update(accounts)
			.set({
				access_token: data.access_token!,
				expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
				refresh_token: data.refresh_token ?? account.refresh_token,
				scope: data.scope ?? account.scope
			})
			.where(
				and(
					eq(accounts.provider, 'spotify'),
					eq(accounts.providerAccountId, account.providerAccountId)
				)
			);

		return data.access_token!;
	} catch (error) {
		// Fall back to the existing token; the caller surfaces Spotify's 401.
		console.error('[spotify] Could not refresh access token:', error);
		return account.access_token;
	}
}

/**
 * Token for reading catalogue data (search, playlists). Prefers the user's own
 * connection so private playlists work, then falls back to the app token so
 * everyone else can still use the app.
 */
export async function getCatalogueToken(userId: string): Promise<string> {
	return (await getSpotifyUserToken(userId)) ?? (await getAppAccessToken());
}
