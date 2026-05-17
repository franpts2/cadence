import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarState } from './calendar-state.svelte';

describe('CalendarState', () => {
	let state: CalendarState;

	beforeEach(() => {
		// Mock fetch globally for all tests
		global.fetch = vi.fn();
		state = new CalendarState();
	});

	it('should initialize with correct default view date', () => {
		const now = new Date();
		expect(state.viewDate.getMonth()).toBe(now.getMonth());
		expect(state.viewDate.getFullYear()).toBe(now.getFullYear());
	});

	it('should navigate to previous month correctly', () => {
		const initialMonth = state.viewDate.getMonth();
		state.prevMonth();
		
		let expectedMonth = initialMonth - 1;
		if (expectedMonth < 0) expectedMonth = 11;
		
		expect(state.viewDate.getMonth()).toBe(expectedMonth);
	});

	it('should navigate to next month correctly', () => {
		const initialMonth = state.viewDate.getMonth();
		state.nextMonth();
		
		let expectedMonth = initialMonth + 1;
		if (expectedMonth > 11) expectedMonth = 0;
		
		expect(state.viewDate.getMonth()).toBe(expectedMonth);
	});

	it('should add toasts correctly', () => {
		state.addToast('Test Message', 'success');
		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0].message).toBe('Test Message');
		expect(state.toasts[0].type).toBe('success');
	});

	it('should remove toasts correctly', () => {
		state.addToast('Test Message', 'success');
		const id = state.toasts[0].id;
		state.removeToast(id);
		expect(state.toasts).toHaveLength(0);
	});

	it('should move a song successfully', async () => {
		const song = { id: '1', name: 'Song 1', artists: [], album: { name: 'Album', images: [] } };
		state.viewDate = new Date(2026, 4, 1); // May 2026
		
		state.songsPerDay['2026-05-01'] = song as any;

		(global.fetch as any).mockResolvedValue({ ok: true });

		await state.moveSong(1, 2);

		expect(state.songsPerDay['2026-05-01']).toBeUndefined();
		expect(state.songsPerDay['2026-05-02']).toEqual(song);
		expect(global.fetch).toHaveBeenCalledWith('/api/songs', expect.objectContaining({
			method: 'PATCH',
			body: JSON.stringify({ fromKey: '2026-05-01', toKey: '2026-05-02' })
		}));
	});

	it('should revert move if API fails', async () => {
		const song = { id: '1', name: 'Song 1', artists: [], album: { name: 'Album', images: [] } };
		state.viewDate = new Date(2026, 4, 1);
		state.songsPerDay['2026-05-01'] = song as any;

		(global.fetch as any).mockResolvedValue({ ok: false });

		await state.moveSong(1, 2);

		expect(state.songsPerDay['2026-05-01']).toEqual(song);
		expect(state.songsPerDay['2026-05-02']).toBeUndefined();
		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0].message).toBe('Failed to move song');
	});
});
