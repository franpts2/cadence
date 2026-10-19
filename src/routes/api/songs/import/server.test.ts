import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { insertMock, valuesMock, onConflictMock, transactionMock } = vi.hoisted(() => {
	type Tx = {
		insert: (table: unknown) => {
			values: (rows: unknown[]) => {
				onConflictDoUpdate: (config: unknown) => Promise<void>;
			};
		};
	};

	const onConflictMock = vi.fn(async (_config: unknown) => {});
	const valuesMock = vi.fn((_rows: unknown[]) => ({ onConflictDoUpdate: onConflictMock }));
	const insertMock = vi.fn((_table: unknown) => ({ values: valuesMock }));
	const transactionMock = vi.fn(async (cb: (tx: Tx) => Promise<void>) => cb({ insert: insertMock }));

	return { insertMock, valuesMock, onConflictMock, transactionMock };
});

vi.mock('$lib/server/db', () => ({
	db: { transaction: transactionMock }
}));

import { POST } from './+server';

const PLAYLIST_ID = '37i9dQZF1DXcBWIGoYBM5M';
const NEXT_URL = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?offset=100&limit=100`;

function makeTrack(index: number) {
	return {
		id: `track-${index}`,
		name: `Song ${index}`,
		artists: [{ name: `Artist ${index}` }],
		album: { name: `Album ${index}`, images: [{ url: `https://img.test/${index}` }] }
	};
}

function makeEvent() {
	return {
		request: new Request('http://localhost/api/songs/import', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				playlistUrl: `https://open.spotify.com/playlist/${PLAYLIST_ID}`,
				importType: 'yearly',
				year: 2026
			})
		}),
		locals: {
			auth: async () => ({ user: { id: 'user-1' }, accessToken: 'access-token' })
		}
	} as any;
}

function jsonResponse(body: unknown) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('POST /api/songs/import', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('follows Spotify pagination and imports more than 100 tracks', async () => {
		const firstPageItems = Array.from({ length: 100 }, (_, i) => ({ track: makeTrack(i) }));
		const secondPageItems = Array.from({ length: 74 }, (_, i) => ({ track: makeTrack(100 + i) }));

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				jsonResponse({
					tracks: { items: firstPageItems, next: NEXT_URL }
				})
			)
			.mockResolvedValueOnce(
				jsonResponse({
					items: secondPageItems,
					next: null
				})
			);

		vi.stubGlobal('fetch', fetchMock);

		const response = await POST(makeEvent());
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			success: true,
			count: 174,
			skipped: 0,
			period: 'year'
		});

		// First request fetches metadata, second follows the `next` page.
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1][0]).toBe(NEXT_URL);
		expect(fetchMock.mock.calls[1][1]).toEqual({
			headers: { Authorization: 'Bearer access-token' }
		});

		// All 174 songs and all 174 daily entries are written.
		expect(valuesMock).toHaveBeenCalledTimes(2);
		expect(valuesMock.mock.calls[0][0]).toHaveLength(174);
		expect(valuesMock.mock.calls[1][0]).toHaveLength(174);
	});

	it('imports a playlist that fits in a single page unchanged', async () => {
		const items = Array.from({ length: 12 }, (_, i) => ({ track: makeTrack(i) }));
		const fetchMock = vi.fn().mockResolvedValueOnce(
			jsonResponse({
				tracks: { items, next: null }
			})
		);

		vi.stubGlobal('fetch', fetchMock);

		const response = await POST(makeEvent());
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.count).toBe(12);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
