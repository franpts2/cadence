# Cadence [in progress]

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
- **Modern Styling:** Built with Tailwind CSS v4 for a cutting-edge, performant UI.
- **Type-Safe Data:** Robust database schema and API validation using Drizzle ORM and Zod.
- **Edge-Ready Database:** Powered by Turso for low-latency data access at the edge.

## Technical Implementation

**Tech Stack**

- **Framework:** SvelteKit (Svelte 5 Runes)
- **Styling:** Tailwind CSS v4
- **Database:** Turso (LibSQL) + Drizzle ORM
- **Auth:** Auth.js (Spotify Provider)
- **Language:** TypeScript
- **Testing:** Vitest + Svelte Testing Library

**System Architecture**

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

**Folder Structure**

```
cadence/
├── src/
│   ├── lib/
│   │   ├── components/      # UI Components (Calendar, Modal, Icons)
│   │   ├── server/          # Server-side logic (DB schema, Auth)
│   │   ├── state/           # Svelte 5 Runes (Global App State)
│   │   ├── types/           # TypeScript Definitions
│   │   └── utils/           # Helper functions & Utilities
│   └── test/                # Global test setup and mocks
├── static/                  # Static assets
├── drizzle.config.ts        # Database migration configuration
├── package.json             # Dependencies and scripts
├── svelte.config.js         # Svelte framework configuration
└── vite.config.ts           # Vite build tool configuration
```

## Testing Configuration

The project utilizes a robust testing suite focused on unit and component integrity.

- **Vitest:** The primary test runner, configured for fast execution and ESM support.
- **Svelte Testing Library:** Used for DOM-based component verification.
- **JSDOM:** Provides a simulated browser environment for testing Svelte components.
- **Mocks:** Global fetch and Spotify API responses are mocked in `src/test/setup.ts`.

**Run Tests:**
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:ui     # Vitest UI runner
```

## Features Implemented

- Reactive calendar state using Svelte 5 Runes
- Spotify OAuth 2.0 flow via Auth.js
- Dynamic song search and metadata retrieval
- Persistent SQLite storage for daily logs
- Custom UI notification (Toast) system
- Fully responsive layout for desktop and mobile

---

_Cadence - Track your life, one song at a time._
