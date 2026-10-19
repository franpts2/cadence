import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// DeleteConfirmModal reads shared state via `getCalendarState()` at render time.
// Provide a real CalendarState instance so the component has context in tests.
// `var` (not `let`) on purpose: the vi.mock factory runs before the module body.
var cal: InstanceType<typeof import('$lib').CalendarState>;

vi.mock('$lib', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib')>();
	const CalendarState = actual.CalendarState;
	cal = new CalendarState();
	cal.viewDate = new Date(2026, 9, 1);
	cal.songsPerDay['2026-10-12'] = {
		id: '123',
		name: 'Red Moon',
		artists: [{ name: 'Test Artist' }],
		album: { name: 'Test Album', images: [] },
		duration_ms: 180000
	} as never;
	return {
		...actual,
		getCalendarState: () => cal
	};
});

import DeleteConfirmModal from './DeleteConfirmModal.svelte';

describe('DeleteConfirmModal', () => {
	beforeEach(() => {
		cal.isDeleteConfirmOpen = false;
		cal.pendingDeleteDay = null;
		global.fetch = vi.fn().mockResolvedValue({ ok: true });
	});

	it('renders nothing while no delete is pending', () => {
		const { container } = render(DeleteConfirmModal);
		expect(container.innerHTML.replace('<!---->', '')).toBe('');
	});

	it('restates the song and its date', () => {
		cal.requestDeleteSong(12);
		render(DeleteConfirmModal);

		expect(screen.getByText('Remove Song?')).toBeInTheDocument();
		expect(screen.getByText('Red Moon')).toBeInTheDocument();
		expect(screen.getByText('October 12, 2026')).toBeInTheDocument();
	});

	it('deletes the song once confirmed', async () => {
		cal.requestDeleteSong(12);
		render(DeleteConfirmModal);

		await fireEvent.click(screen.getByText('Remove'));

		expect(global.fetch).toHaveBeenCalledWith(
			'/api/songs?dateKey=2026-10-12',
			{ method: 'DELETE' }
		);
		expect(cal.isDeleteConfirmOpen).toBe(false);
		expect(cal.pendingDeleteDay).toBeNull();
	});

	it('keeps the song when cancelled', async () => {
		cal.requestDeleteSong(12);
		render(DeleteConfirmModal);

		await fireEvent.click(screen.getByText('Cancel'));

		expect(global.fetch).not.toHaveBeenCalled();
		expect(cal.isDeleteConfirmOpen).toBe(false);
		expect(cal.pendingDeleteDay).toBeNull();
	});

	it('focuses the safe action on open', () => {
		cal.requestDeleteSong(12);
		render(DeleteConfirmModal);

		expect(document.activeElement).toBe(screen.getByText('Cancel'));
	});
});
