import type { LayoutServerLoad } from "./$types";
import { getSpotifyAccount } from "$lib/server/spotify-auth";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Spotify is optional now: it only unlocks private playlists and export.
  const spotifyConnected = session?.user?.id
    ? Boolean(await getSpotifyAccount(session.user.id))
    : false;

  return {
    session,
    spotifyConnected,
  };
};
