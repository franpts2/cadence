import { describe, it, expect } from 'vitest';
import type { Song } from '../types';
import {
	SHARE_IMAGE_HEIGHT,
	SHARE_IMAGE_WIDTH,
	computeShareLayout,
	getShareDays,
	getShareFilename
} from './share-image';

function makeSong(id: string): Song {
	return {
		id,
		name: `Song ${id}`,
		artists: [{ name: 'Artist' }],
		album: { name: 'Album', images: [{ url: `https://example.com/${id}.jpg` }] },
		duration_ms: 0
	};
}

describe('getShareDays', () => {
	it('returns exactly the days of the requested month', () => {
		const days = getShareDays(2026, 1, {});
		expect(days).toHaveLength(28);
		expect(days[0].day).toBe(1);
		expect(days[27].day).toBe(28);
	});

	it('maps songs by date and never leaks songs from other months', () => {
		const songs = {
			'2026-02-01': makeSong('one'),
			'2026-02-28': makeSong('two'),
			'2026-01-15': makeSong('other-month'),
			'2026-03-01': makeSong('next-month')
		};

		const days = getShareDays(2026, 1, songs);

		expect(days[0].song?.id).toBe('one');
		expect(days[27].song?.id).toBe('two');
		expect(days.filter((day) => day.song).length).toBe(2);
	});

	it('uses a leap day when it exists', () => {
		const days = getShareDays(2028, 1, {});
		expect(days).toHaveLength(29);
	});
});

describe('computeShareLayout', () => {
	it('fits seven columns and the gaps into the grid width', () => {
		const layout = computeShareLayout(2026, 9);

		expect(layout.cell * 7 + layout.gap * 6).toBeCloseTo(layout.gridWidth, 5);
		expect(layout.gridX + layout.gridWidth).toBeLessThanOrEqual(SHARE_IMAGE_WIDTH);
	});

	it('grows the grid to six rows for months that need them', () => {
		// 1 August 2026 is a Saturday, so 31 days spill into a sixth row.
		const layout = computeShareLayout(2026, 7);
		expect(layout.rows).toBe(6);
		expect(layout.gridHeight).toBeCloseTo(layout.cell * 6 + layout.gap * 5, 5);
	});

	it('keeps the month block inside the card', () => {
		for (let month = 0; month < 12; month++) {
			const layout = computeShareLayout(2026, month);
			expect(layout.gridY).toBeGreaterThan(layout.weekdayBaseline);
			expect(layout.gridY + layout.gridHeight).toBeLessThan(SHARE_IMAGE_HEIGHT);
		}
	});
});

describe('getShareFilename', () => {
	it('names the file after the month and year', () => {
		expect(getShareFilename(2026, 0)).toBe('cadence-january-2026.png');
		expect(getShareFilename(2025, 11)).toBe('cadence-december-2025.png');
	});
});
