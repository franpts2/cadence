import "./lib/server/env";
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Spotify from "@auth/sveltekit/providers/spotify";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from "$env/static/private";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "$lib/server/db";
import { accounts, sessions, users } from "$lib/server/db/schema";
import { SPOTIFY_SCOPES } from "$lib/server/spotify";

export const { handle, signIn, signOut } = SvelteKitAuth({
  // Cloudflare Pages puts the app behind Cloudflare's proxy, so the forwarded host
  // is the canonical host. This is required on Workers, where process.env is not
  // available for Auth.js to read AUTH_TRUST_HOST at runtime.
  trustHost: true,
  // Auth.js's built-in error page is a dead end: it has no way back and says
  // "Server error" even for recoverable failures like an expired PKCE cookie.
  // Send users to our own page, which explains what happened and offers a retry.
  pages: {
    error: "/auth-error",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: {
    strategy: "jwt",
  },
  providers: [
    // Primary identity provider. Spotify only lets a limited number of accounts
    // use an app in development mode, so it cannot be the way people sign up.
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // Google verifies email ownership, so an account that already exists with
      // the same address (e.g. one created before Google sign-in) is linked
      // instead of duplicated. This keeps existing calendars intact.
      allowDangerousEmailAccountLinking: true,
    }),
    // Optional connection, started from inside the app by a signed-in user.
    // Auth.js links it to the current user and stores the tokens in `account`.
    Spotify({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      // PKCE keeps its verifier in a 15-minute cookie and Auth.js refuses the
      // callback without it. Connecting Spotify can take longer than that (e.g.
      // "Continue with Facebook") or finish in another browser, which used to
      // leave people on an unrecoverable error page. Spotify is a confidential
      // client, so the client secret still protects the code exchange.
      checks: [],
      authorization: `https://accounts.spotify.com/authorize?scope=${SPOTIFY_SCOPES.join('+')}&show_dialog=true`
    }),
  ],
  callbacks: {
    // Identity only. Spotify tokens live in the database, not in the session, so
    // they keep working across devices and after the JWT is rotated.
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const userId =
        (token.sub as string | undefined) ??
        (token as { user?: { id?: string } }).user?.id;
      if (session.user && userId) {
        session.user.id = userId;
      }
      return session;
    }
  }
});
