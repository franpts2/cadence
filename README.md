# Cadence

<div align="left">
	<img src="https://img.shields.io/badge/Svelte_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5"/>
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
	<img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
	<img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit"/>
	<img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM"/>
	<img src="https://img.shields.io/badge/Turso-000000?style=for-the-badge&logo=turso&logoColor=00FFA3" alt="Turso"/>
	<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
	<a href="https://cadence.franciscapt.dev"><img src="https://img.shields.io/badge/live-cadence.franciscapt.dev-00C853?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live site"/></a>
</div>

## About

Cadence is a personal music journal that integrates with Spotify to help you track your life through songs. By selecting one track each day, you build a visual and interactive calendar of your musical journey, powered by Svelte 5's modern reactive primitives.

It's live at **[cadence.franciscapt.dev](https://cadence.franciscapt.dev)** — sign in and start picking a song a day.

## Key Features

- **Spotify Integration:** Real-time song search via the Spotify Web API — no Spotify account or login required.
- **Interactive Calendar:** A fluid, responsive calendar interface built with Svelte 5 Runes for seamless state management.
- **Daily Selection:** Log your "song of the day" to build a persistent history of your listening habits.
- **Drag & Drop:** Move songs between days on desktop and touch-drag on mobile.
- **Shareable Months:** Share the month you're viewing as a clean 4:5 image of just the calendar.
- **Modern Styling:** Built with Tailwind CSS v4 for a cutting-edge, performant UI.
- **Type-Safe Data:** Robust database schema and API validation using Drizzle ORM and Zod.
- **Edge-Ready Database:** Powered by Turso for low-latency data access at the edge.

## Tech Stack

- **Framework:** SvelteKit (Svelte 5 Runes)
- **Styling:** Tailwind CSS v4
- **Database:** Turso (LibSQL) + Drizzle ORM
- **Auth:** Auth.js (Google OAuth)
- **Language:** TypeScript
- **Testing:** Vitest + Svelte Testing Library

## System Architecture

```
┌──────────────────────────────┐
│       Frontend (Svelte 5)    │
│  Tailwind CSS + TypeScript   │
├──────────────────────────────┤
│       SvelteKit Server       │
│    Auth.js + Drizzle ORM     │
├──────────────────────────────┤
│       Turso (LibSQL)         │
└──────────────────────────────┘
```

## Folder Structure

```
cadence/
├── src/
│   ├── lib/
│   │   ├── components/      # UI Components (Calendar, Modal, Icons)
│   │   ├── server/          # Server-side logic (DB schema, Auth)
│   │   ├── state/           # Svelte 5 Runes (Global App State)
│   │   ├── types/           # TypeScript Definitions
│   │   └── utils/           # Helper functions & Utilities
│   ├── routes/              # SvelteKit routes and API endpoints
│   ├── test/                # Global test setup and mocks
│   └── app.html             # HTML template
├── static/                  # Static assets
├── drizzle.config.ts        # Database migration configuration
├── package.json             # Dependencies and scripts
├── svelte.config.js         # Svelte framework configuration
└── vite.config.ts           # Vite build tool configuration
```

## Getting Started

### Prerequisites

- Node.js 22.13+ (see `.nvmrc`)
- A [Google Cloud](https://console.cloud.google.com/) project (OAuth client for sign-in)
- A [Spotify Developer](https://developer.spotify.com/dashboard) account (app-only token for search)
- A [Turso](https://turso.tech) account (free tier is enough)

### 1. Clone and install

```bash
git clone git@github.com:franpts2/cadence.git
cd cadence
npm install
```

### 2. Create a Google OAuth client

Sign-in uses Google. Create an OAuth client:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or pick a project, then configure the OAuth consent screen.
3. Create an **OAuth client ID** of type *Web application*.
4. Add these Authorised redirect URIs:
   - `http://localhost:5173/auth/callback/google`
   - `https://cadence.franciscapt.dev/auth/callback/google`
5. Copy the **Client ID** and **Client Secret**.

> Only the default `openid`, `email`, and `profile` scopes are used, so the consent screen can be published without Google verification.

### 3. Create a Spotify app

Song search uses Spotify's app-only (Client Credentials) token. There is no Spotify OAuth
flow and no redirect URI to configure.

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app.
3. Copy the **Client ID** and **Client Secret**.

> Development-mode apps cannot authorize arbitrary Spotify users, but Cadence does not ask
> for that: the Client Credentials token reads public catalogue data only. Development-mode
> request quotas still apply, so heavy use may return `429` responses.

### 4. Create a Turso database

```bash
# Install the Turso CLI if you haven't already
curl -sSfL https://get.turso.tech/install.sh | bash

# Log in and create a database
turso auth login
turso db create cadence

# Get the connection URL and authentication token
turso db show cadence --url
turso db tokens create cadence
```

### 5. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values:

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
AUTH_SECRET=your_auth_secret_generate_with_openssl_rand_base64_32
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### 6. Push the database schema

```bash
npm run db:push
```

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with Google.

## Testing

```bash
npm run test        # Run all tests once
npm run test:watch  # Watch mode
npm run test:ui     # Vitest UI runner
```

## Building for Production

```bash
npm run check   # Type-check the project
npm run build   # Build the application
npm run preview # Preview the production build locally
```

## Deployment

Cadence runs in production on **Cloudflare Pages** with [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare), at **[cadence.franciscapt.dev](https://cadence.franciscapt.dev)**.

### Cloudflare Pages project

The live site is served by a Pages project named `cadence-franciscapt`, connected to this repository. If you fork or redeploy it, use these build settings:

| Setting | Value |
|---------|-------|
| Framework preset | SvelteKit |
| Build command | `npm run build` |
| Build output directory | `.svelte-kit/cloudflare` |
| Root directory | `/` |

Add every variable from the [Environment Variables](#environment-variables) table to the Pages project (Production **and** Preview). The app reads them through `$env/static/private`, so they must be present at build time.

### Custom domain

The production domain is `cadence.franciscapt.dev`, attached via **Workers & Pages → cadence-franciscapt → Custom domains**. When `franciscapt.dev` is a zone in the same Cloudflare account, the required proxied CNAME is created automatically. If it is not, add:

| Type | Name | Content | Proxy status |
|------|------|---------|--------------|
| `CNAME` | `cadence` | `cadence-franciscapt.pages.dev` | Proxied |

Add the production callback URL to the Google OAuth client:

```
https://cadence.franciscapt.dev/auth/callback/google
```

### Previewing / deploying locally

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare
```

To deploy from the CLI instead of the Git integration:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name cadence-franciscapt
```

> **Note:** Existing Spotify connections are no longer used. Cadence only needs Google
> sign-in and the app-only Spotify token.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (sign-in) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID (app-only token for search) |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `AUTH_SECRET` | Random secret for Auth.js sessions |
| `TURSO_DATABASE_URL` | Turso database connection URL |
| `TURSO_AUTH_TOKEN` | Turso database authentication token |
| `AUTH_TRUST_HOST` | Set to `true` for local development or when behind a trusted reverse proxy |

## Authentication model

Cadence signs users in with **Google**. That is the only OAuth flow: there is no way to
connect a Spotify account, and no feature depends on one.

Song search uses Spotify's **Client Credentials** flow — an app-only token cached per Worker
isolate. It reads public catalogue data, so it works for every user without a Spotify login
and is unaffected by Spotify's per-user development-mode allowlist.

An account created with Spotify before this change is preserved: signing in with Google using
the same email address links to the existing user, calendar included.

## Troubleshooting sign-in

Failed sign-ins land on `/auth-error` instead of Auth.js's built-in error page. That page
shows an error code and, when signed out, a **Try again with Google** button, so a transient
failure is never a dead end.

`Configuration` is Auth.js's catch-all for any unexpected server-side error — check the
server-side log emitted by `src/routes/auth-error/+page.server.ts` for the code the user hit.

Other codes: `AccessDenied` (permissions were declined), `Verification` (an expired sign-in
link), `OAuthAccountNotLinked` (that Google account is attached to another Cadence user), and
`MissingCSRF` (a stale sign-in form).

## License

This project is licensed under the [MIT License](LICENSE).

---

_Cadence - Track your life, one song at a time._
