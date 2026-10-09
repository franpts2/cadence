import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';

// CalendarSong reads shared state via `getCalendarState()` at render time.
// Provide a real CalendarState instance so the component has context in tests.
vi.mock('$lib', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib')>();
	const cal = new actual.CalendarState();
	return {
		...actual,
		getCalendarState: () => cal
	};
});

import CalendarSong from './CalendarSong.svelte';

describe('CalendarSong component', () => {
	const mockSong = {
		id: '123',
		name: 'Test Song',
		artists: [{ name: 'Test Artist' }],
		album: {
			name: 'Test Album',
			images: [{ url: 'https://example.com/image.jpg' }]
		},
		duration_ms: 180000
	};

	it('should render song name', () => {
		render(CalendarSong, { song: mockSong, day: 1 });
		expect(screen.getByText('Test Song')).toBeInTheDocument();
	});

	it('should render album image if provided', () => {
		const { container } = render(CalendarSong, { song: mockSong, day: 1 });
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
	});
});
