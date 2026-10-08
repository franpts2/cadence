# Cadence

<div align="left">
	<img src="https://img.shields.io/badge/Svelte_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte 5"/>
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
	<img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
	<img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit"/>
	<img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM"/>
	<img src="https://img.shields.io/badge/Turso-000000?style=for-the-badge&logo=turso&logoColor=00FFA3" alt="Turso"/>
	<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
</div>

## About

Cadence is a personal music journal that integrates with Spotify to help you track your life through songs. By selecting one track each day, you build a visual and interactive calendar of your musical journey, powered by Svelte 5's modern reactive primitives.

## Key Features

- **Spotify Integration:** Secure authentication and real-time song searching via the Spotify Web API.
- **Interactive Calendar:** A fluid, responsive calendar interface built with Svelte 5 Runes for seamless state management.
- **Daily Selection:** Log your "song of the day" to build a persistent history of your listening habits.
- **Drag & Drop:** Move songs between days on desktop and touch-drag on mobile.
- **Playlist Import:** Bring an existing Spotify playlist into a month or year in one click.
- **Playlist Export:** Turn your calendar back into a private Spotify playlist.
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

This project uses `@sveltejs/adapter-auto` by default, which auto-detects some platforms. For a production deployment, choose the adapter that matches your platform and install it:

- **Vercel:** `npm install -D @sveltejs/adapter-vercel`
- **Netlify:** `npm install -D @sveltejs/adapter-netlify`
- **Cloudflare Pages:** `npm install -D @sveltejs/adapter-cloudflare`
- **Node server:** `npm install -D @sveltejs/adapter-node`

Then update `svelte.config.js` to import and use your chosen adapter. Set the same environment variables on your hosting provider.

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

## License

This project is licensed under the [MIT License](LICENSE).

---

_Cadence - Track your life, one song at a time._
