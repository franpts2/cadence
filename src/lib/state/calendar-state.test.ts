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

	it('should navigate to previous month correctly with debounce', () => {
		state.viewDate = new Date(2026, 4, 1); // May 2026
		state.prevMonth();
		expect(state.viewDate.getMonth()).toBe(3); // April
		
		// Immediate second call should be ignored due to debounce
		state.prevMonth();
		expect(state.viewDate.getMonth()).toBe(3); 
	});

	it('should navigate to next month correctly with debounce', () => {
		state.viewDate = new Date(2026, 4, 1); // May 2026
		state.nextMonth();
		expect(state.viewDate.getMonth()).toBe(5); // June
		
		// Immediate second call should be ignored due to debounce
		state.nextMonth();
		expect(state.viewDate.getMonth()).toBe(5);
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

	describe('delete confirmation', () => {
		const song = { id: '1', name: 'Song 1', artists: [], album: { name: 'Album', images: [] } };

		beforeEach(() => {
			state.viewDate = new Date(2026, 4, 1);
			state.songsPerDay['2026-05-01'] = song as any;
		});

		it('should open the confirmation without deleting', () => {
			state.requestDeleteSong(1);

			expect(state.isDeleteConfirmOpen).toBe(true);
			expect(state.pendingDeleteDay).toBe(1);
			expect(state.songsPerDay['2026-05-01']).toEqual(song);
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it('should delete the song once confirmed', async () => {
			(global.fetch as any).mockResolvedValue({ ok: true });

			state.requestDeleteSong(1);
			await state.confirmDeleteSong();

			expect(state.songsPerDay['2026-05-01']).toBeUndefined();
			expect(state.isDeleteConfirmOpen).toBe(false);
			expect(state.pendingDeleteDay).toBeNull();
			expect(global.fetch).toHaveBeenCalledWith(
				'/api/songs?dateKey=2026-05-01',
				{ method: 'DELETE' }
			);
		});

		it('should keep the song when cancelled', () => {
			state.requestDeleteSong(1);
			state.cancelDeleteSong();

			expect(state.songsPerDay['2026-05-01']).toEqual(song);
			expect(state.isDeleteConfirmOpen).toBe(false);
			expect(state.pendingDeleteDay).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it('should route the preview deletion through the confirmation', async () => {
			state.openPreview(song as any, 1);
			(global.fetch as any).mockResolvedValue({ ok: true });

			state.removePreviewSong();

			expect(state.previewingSong).toBeNull();
			expect(state.previewingDay).toBeNull();
			expect(state.isDeleteConfirmOpen).toBe(true);
			expect(state.pendingDeleteDay).toBe(1);
			expect(state.songsPerDay['2026-05-01']).toEqual(song);
			expect(global.fetch).not.toHaveBeenCalled();
		});
	});
});
