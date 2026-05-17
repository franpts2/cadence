import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import PlaylistControls from './PlaylistControls.svelte';

describe('PlaylistControls component', () => {
	it('should render import and export buttons', () => {
		render(PlaylistControls);
		expect(screen.getByText('Import')).toBeInTheDocument();
		expect(screen.getByText('Export')).toBeInTheDocument();
	});

	it('should have tooltips/titles', () => {
		render(PlaylistControls);
		expect(screen.getByTitle('Import Playlist')).toBeInTheDocument();
		expect(screen.getByTitle('Export Playlist')).toBeInTheDocument();
	});
});
