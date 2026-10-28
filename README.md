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

It's live at **[cadence.franciscapt.dev](https://cadence.franciscapt.dev)** — sign in with Spotify and start picking a song a day.

## Key Features

- **Spotify Integration:** Secure authentication and real-time song searching via the Spotify Web API.
- **Interactive Calendar:** A fluid, responsive calendar interface built with Svelte 5 Runes for seamless state management.
- **Daily Selection:** Log your "song of the day" to build a persistent history of your listening habits.
- **Drag & Drop:** Move songs between days on desktop and touch-drag on mobile.
- **Playlist Import:** Bring an existing Spotify playlist into a month or year in one click.
- **Playlist Export:** Turn your calendar back into a private Spotify playlist.
- **Shareable Months:** Share the month you're viewing as a clean 4:5 image of just the calendar.
- **Modern Styling:** Built with Tailwind CSS v4 for a cutting-edge, performant UI.
- **Type-Safe Data:** Robust database schema and API validation using Drizzle ORM and Zod.
- **Edge-Ready Database:** Powered by Turso for low-latency data access at the edge.

## Tech Stack

- **Framework:** SvelteKit (Svelte 5 Runes)
- **Styling:** Tailwind CSS v4
- **Database:** Turso (LibSQL) + Drizzle ORM
- **Auth:** Auth.js (Spotify Provider)
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

- Node.js 20+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account
- A [Turso](https://turso.tech) account (free tier is enough)

### 1. Clone and install

```bash
git clone git@github.com:franpts2/cadence.git
cd cadence
npm install
```

### 2. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app.
3. Add `http://localhost:5173/auth/callback/spotify` to the Redirect URIs.
4. Copy the **Client ID** and **Client Secret**.

### 3. Create a Turso database

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

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values:

```env
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

### 5. Push the database schema

```bash
npm run db:push
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with Spotify.

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

Add the production callback URL to the Spotify app's Redirect URIs:

```
https://cadence.franciscapt.dev/auth/callback/spotify
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

> **Note:** After adding the `playlist-modify-private` scope for the export feature, existing users may need to log out and back in to grant the new permission.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `AUTH_SECRET` | Random secret for Auth.js sessions |
| `TURSO_DATABASE_URL` | Turso database connection URL |
| `TURSO_AUTH_TOKEN` | Turso database authentication token |
| `AUTH_TRUST_HOST` | Set to `true` for local development or when behind a trusted reverse proxy |

## Troubleshooting sign-in

Failed sign-ins land on `/auth-error` instead of Auth.js's built-in error page. That page
shows an error code and a **Try again** button, so a transient failure is never a dead end.

`Configuration` is Auth.js's catch-all for any unexpected server-side error. The most common
cause used to be a missing PKCE cookie: Auth.js stores the verifier in a 15-minute cookie and
rejects the callback without it. A slow Spotify login (for example "Continue with Facebook")
or a login that finishes in a different browser was enough to block sign-up.

The Spotify provider now sets `checks: []`, so sign-in no longer depends on that cookie.
This is safe because Spotify is a confidential client — the client secret is still required
to exchange the authorization code. The retry page remains as a fallback for genuine
provider or network failures.

Other codes: `AccessDenied` (the Spotify permission screen was declined),
`Verification` (an expired sign-in link), and `MissingCSRF` (a stale sign-in form).
Each failed request is also logged server-side with its code by
`src/routes/auth-error/+page.server.ts`.

## License

This project is licensed under the [MIT License](LICENSE).

---

_Cadence - Track your life, one song at a time._
