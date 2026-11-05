import "./lib/server/env";
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "$lib/server/db";
import { accounts, sessions, users } from "$lib/server/db/schema";

export const { handle, signIn, signOut } = SvelteKitAuth({
  // Cloudflare Pages puts the app behind Cloudflare's proxy, so the forwarded host
  // is the canonical host. This is required on Workers, where process.env is not
  // available for Auth.js to read AUTH_TRUST_HOST at runtime.
  trustHost: true,
  // Auth.js's built-in error page is a dead end: it has no way back. Send users
  // to our own page, which explains what happened and offers a retry.
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
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // Google verifies email ownership, so an account that already exists with
      // the same address (e.g. one created before Google sign-in) is linked
      // instead of duplicated. This keeps existing calendars intact.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
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
