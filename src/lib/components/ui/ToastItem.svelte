<script lang="ts">
	import type { Toast } from '$lib/types';
	import { CloseIcon, prefersReducedMotion } from '$lib';

	let {
		toast,
		onDismiss,
		onPause,
		onResume
	}: {
		toast: Toast;
		onDismiss: () => void;
		onPause: () => void;
		onResume: () => void;
	} = $props();

	const DISMISS_DISTANCE = 44;
	const DISMISS_VELOCITY = -500;

	let itemEl = $state<HTMLElement>();
	let offsetY = $state(0);
	let dragging = $state(false);
	let settling = $state(false);
	let dragTransition = $state('none');
	let pointerId: number | null = null;
	let startY = 0;
	let lastY = 0;
	let lastTime = 0;
	let velocity = 0;

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		// The close button owns its own taps.
		if ((e.target as Element).closest('button')) return;

		dragging = true;
		settling = false;
		pointerId = e.pointerId;
		startY = e.clientY;
		lastY = e.clientY;
		lastTime = performance.now();
		velocity = 0;
		dragTransition = 'none';
		onPause();

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;
		if (e.cancelable) e.preventDefault();

		// Toasts enter from the top, so up is the only dismiss direction.
		offsetY = Math.min(0, e.clientY - startY);

		const now = performance.now();
		const dt = now - lastTime;
		if (dt > 0) velocity = ((e.clientY - lastY) / dt) * 1000;
		lastY = e.clientY;
		lastTime = now;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;
		stopTracking();
		if (performance.now() - lastTime > 80) velocity = 0;

		if (offsetY < -DISMISS_DISTANCE || velocity < DISMISS_VELOCITY) {
			dismiss();
		} else {
			snapBack();
			onResume();
		}
	}

	function handlePointerCancel() {
		if (!dragging) return;
		stopTracking();
		snapBack();
		onResume();
	}

	function stopTracking() {
		if (pointerId !== null) {
			try {
				itemEl?.releasePointerCapture(pointerId);
			} catch {
				// Pointer already gone.
			}
		}
		pointerId = null;
		dragging = false;
	}

	function snapBack() {
		settling = true;
		dragTransition = prefersReducedMotion()
			? 'none'
			: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)';
		offsetY = 0;
		setTimeout(() => {
			settling = false;
			dragTransition = 'none';
		}, 200);
	}

	function dismiss() {
		settling = true;
		const reduce = prefersReducedMotion();
		const distance = -(itemEl?.offsetHeight ?? 56) - 16;
		dragTransition = reduce ? 'none' : 'transform 160ms cubic-bezier(0.4, 0, 1, 1)';
		offsetY = distance;

		setTimeout(() => onDismiss(), reduce ? 0 : 150);
	}
</script>

<div
	bind:this={itemEl}
	role="group"
	class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl border border-border bg-surface/95 backdrop-blur-md text-sm text-white touch-none select-none"
	style:transform={dragging || settling || offsetY !== 0
		? `translate3d(0, ${offsetY}px, 0)`
		: undefined}
	style:transition={dragTransition}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
>
	<div class="flex items-center gap-2 min-w-0">
		<span class="break-words">{toast.message}</span>
	</div>
	<button
		onclick={() => onDismiss()}
		class="shrink-0 text-text-dim hover:text-accent-hover transition-colors"
		aria-label="Dismiss notification"
	>
		<CloseIcon class="h-4 w-4" />
	</button>
</div>
