import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('$app/state', () => ({
	page: {
		data: {
			session: null
		}
	}
}));

// jsdom doesn't implement matchMedia, which `prefersReducedMotion()` calls when
// any modal/popover mounts. Report "no preference" so motion utilities work.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
	window.matchMedia = ((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})) as unknown as typeof window.matchMedia;
}

// jsdom has no Web Animations API, which every Svelte `transition:` runs through.
// Resolve instantly so transitions (and the DOM cleanup they trigger) complete.
if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
	Element.prototype.animate = function () {
		const animation = {
			playState: 'running',
			currentTime: 0,
			onfinish: null as null | (() => void),
			oncancel: null,
			cancel() {
				animation.onfinish = null;
			},
			finish() {
				animation.onfinish?.();
			},
			play() {},
			pause() {},
			reverse() {},
			commitStyles() {},
			addEventListener() {},
			removeEventListener() {}
		};

		queueMicrotask(() => {
			animation.playState = 'finished';
			animation.onfinish?.();
		});

		return animation;
	} as unknown as typeof Element.prototype.animate;
}
