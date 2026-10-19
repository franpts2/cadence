/**
 * Spotify OAuth scopes used by Cadence.
 *
 * Keep this list in sync with the Spotify Developer Dashboard and the
 * requirements of every API call the app makes.
 */
export const SPOTIFY_SCOPES = [
	'user-read-email',
	'user-read-private',
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-private',
	'playlist-modify-public'
] as const;

/**
 * Scopes required to export the calendar to a Spotify playlist.
 *
 * Both modify scopes are requested because Spotify may create the playlist as
 * public even when `public: false` is sent, and adding items to a public
 * playlist requires `playlist-modify-public`.
 */
export const REQUIRED_EXPORT_SCOPES = ['playlist-modify-private', 'playlist-modify-public'] as const;

/**
 * Checks whether a space-separated Spotify scope string contains every
 * required scope. The scope returned by Spotify is a space-separated list.
 */
export function hasScopes(granted: string | undefined | null, required: readonly string[]): boolean {
	if (!granted) return false;
	const grantedScopes = new Set(granted.split(/\s+/).filter(Boolean));
	return required.every((scope) => grantedScopes.has(scope));
}
