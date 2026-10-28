import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRawSnippet } from 'svelte';
import Tooltip from './Tooltip.svelte';

const children = createRawSnippet(() => ({
	render: () => '<button type="button">Song</button>'
}));

describe('Tooltip component', () => {
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		// Pretend we have a fine pointer with hover so the tooltip is allowed to open.
		window.matchMedia = ((query: string) => ({
			matches: query.includes('hover: hover'),
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		})) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
		document.body.innerHTML = '';
	});

	it('portals the tooltip to <body> so clipping ancestors cannot cut it off', async () => {
		const { container } = render(Tooltip, { text: 'Click to open song details', delay: 0, children });

		await fireEvent.mouseEnter(container.firstElementChild as Element);

		const tip = await screen.findByText('Click to open song details');
		const bubble = tip.closest('div.fixed');

		expect(bubble).toBeInTheDocument();
		expect(bubble?.parentElement).toBe(document.body);
		expect(bubble).not.toBe(container.querySelector('div'));
	});

	it('shows each line of a multi-line hint', async () => {
		const { container } = render(Tooltip, {
			text: 'Click to open song details\nDrag to change the day',
			delay: 0,
			children
		});

		await fireEvent.mouseEnter(container.firstElementChild as Element);

		expect(await screen.findByText('Click to open song details')).toBeInTheDocument();
		expect(screen.getByText('Drag to change the day')).toBeInTheDocument();
	});

	it('removes the portal when hidden', async () => {
		const { container } = render(Tooltip, { text: 'Hint', delay: 0, children });
		const trigger = container.firstElementChild as Element;

		await fireEvent.mouseEnter(trigger);
		expect(await screen.findByText('Hint')).toBeInTheDocument();

		await fireEvent.mouseLeave(trigger);
		await waitFor(() => expect(screen.queryByText('Hint')).not.toBeInTheDocument());
	});
});
