import { SvelteKitAuth } from "@auth/sveltekit";
import Spotify from "@auth/sveltekit/providers/spotify";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";

export const handle = SvelteKitAuth({
  providers: [
    Spotify({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      // Crucial: Ask for permission to modify playlists
      authorization: "https://accounts.spotify.com/authorize?scope=playlist-modify-public,playlist-modify-private,playlist-read-private"
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token object
      if (account) {
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      return session;
    }
  }
});
