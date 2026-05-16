import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
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
		render(CalendarSong, { song: mockSong });
		expect(screen.getByText('Test Song')).toBeInTheDocument();
	});

	it('should render album image if provided', () => {
		const { container } = render(CalendarSong, { song: mockSong });
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
	});
});
