import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import SongPreviewModal from './SongPreviewModal.svelte';
import type { Song } from '$lib/types';

const mockSong: Song = {
	id: '123',
	name: 'Test Song',
	artists: [{ name: 'Test Artist' }],
	album: {
		name: 'Test Album',
		images: [{ url: 'https://example.com/image.jpg' }]
	},
	duration_ms: 3000
};

describe('SongPreviewModal', () => {
	it('renders song details when open', () => {
		render(SongPreviewModal, {
			song: mockSong,
			isOpen: true,
			onClose: vi.fn()
		});

		expect(screen.getByText('Test Song')).toBeInTheDocument();
		expect(screen.getByText('Test Artist')).toBeInTheDocument();
		expect(screen.getByText('Test Album')).toBeInTheDocument();
		
		const image = screen.getByAltText('Test Album');
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
	});

	it('does not render anything when closed', () => {
		const { container } = render(SongPreviewModal, {
			song: mockSong,
			isOpen: false,
			onClose: vi.fn()
		});

		expect(container.innerHTML.replace('<!---->', '')).toBe('');
	});

	it('calls onClose when close button is clicked', async () => {
		const onClose = vi.fn();
		render(SongPreviewModal, {
			song: mockSong,
			isOpen: true,
			onClose
		});

		const closeButton = screen.getByLabelText('Close');
		await fireEvent.click(closeButton);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when backdrop is clicked', async () => {
		const onClose = vi.fn();
		render(SongPreviewModal, {
			song: mockSong,
			isOpen: true,
			onClose
		});

		// Modal.svelte has a backdrop with aria-hidden="true" and onclick={onClose}
		const backdrop = document.querySelector('.bg-bg\\/80');
		
		if (backdrop) {
			await fireEvent.click(backdrop);
			expect(onClose).toHaveBeenCalledTimes(1);
		} else {
			throw new Error('Backdrop not found');
		}
	});
});
