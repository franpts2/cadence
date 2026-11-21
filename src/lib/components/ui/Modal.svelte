<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { sheetIn, sheetOut, prefersReducedMotion } from '$lib';
	import type { Snippet } from 'svelte';
	import CloseIcon from '../icons/CloseIcon.svelte';

	let { isOpen, onClose, onClosed, children } = $props<{
		isOpen: boolean;
		onClose: () => void;
		/** Fires once the exit animation has finished — use it to reset content. */
		onClosed?: () => void;
		children: Snippet;
	}>();

	let wrapperEl = $state<HTMLElement>();
	let dragY = $state(0);
	let dragging = $state(false);
	let settling = $state(false);
	let dragTransition = $state('none');
	let suppressClick = false;
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let lastY = 0;
	let lastTime = 0;
	let velocity = 0;
	let sheetHeight = 0;
	let moved = false;
	let isOpenLast = false;
	let closingByDrag = false;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;

	const SNAP_MS = 220;
	const DISMISS_MS = 190;
	const DISMISS_DISTANCE = 0.25; // fraction of the sheet height
	const DISMISS_VELOCITY = 500; // px/s

	// Reset the drag visual on every fresh open. The old sheet may still be
	// mid-exit when a new one opens, so resetting here keeps it from flashing.
	$effect(() => {
		if (isOpen && !isOpenLast) {
			dragY = 0;
			dragging = false;
			settling = false;
			dragTransition = 'none';
			suppressClick = false;
			closingByDrag = false;
			if (closeTimer) {
				clearTimeout(closeTimer);
				closeTimer = null;
			}
		}
		isOpenLast = isOpen;
	});

	const dragProgress = $derived(
		sheetHeight > 0 ? Math.min(1, Math.max(0, dragY / sheetHeight)) : 0
	);
	const backdropOpacity = $derived(1 - dragProgress);

	function isPhone() {
		return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
	}

	function handlePointerDown(e: PointerEvent) {
		if (!isPhone() || settling || e.button !== 0) return;
		// Never start a sheet drag from an interactive control.
		if ((e.target as Element).closest('button, a, input, textarea, select, [data-no-drag]')) {
			return;
		}

		dragging = true;
		moved = false;
		pointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		lastY = e.clientY;
		lastTime = performance.now();
		velocity = 0;
		dragY = 0;
		sheetHeight = wrapperEl?.offsetHeight ?? 400;
		dragTransition = 'none';

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		// Wait for a few pixels, then lock to the dominant axis. Horizontal
		// gestures belong to the content, not to the sheet.
		if (!moved) {
			if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
			if (Math.abs(dx) > Math.abs(dy) * 1.2) {
				stopTracking();
				return;
			}
			moved = true;
		}

		if (e.cancelable) e.preventDefault();
		// Down only; dragging up just rubber-bands back to zero.
		dragY = Math.max(0, dy);

		const now = performance.now();
		const dt = now - lastTime;
		if (dt > 0) velocity = ((e.clientY - lastY) / dt) * 1000;
		lastY = e.clientY;
		lastTime = now;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;

		const wasMoved = moved;
		stopTracking();

		if (!wasMoved) return;

		// A finger that stopped moving before lifting carries no velocity.
		if (performance.now() - lastTime > 80) velocity = 0;

		// A drag must never turn into a click on the content underneath.
		suppressClick = true;

		const height = sheetHeight || wrapperEl?.offsetHeight || 400;
		if (dragY > height * DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
			dismissByDrag(height);
		} else {
			snapBack();
		}
	}

	function handlePointerCancel() {
		if (!dragging) return;
		stopTracking();
		snapBack();
	}

	function stopTracking() {
		if (pointerId !== null) {
			try {
				wrapperEl?.releasePointerCapture(pointerId);
			} catch {
				// The pointer may already be gone; nothing to release.
			}
		}
		pointerId = null;
		dragging = false;
	}

	function snapBack() {
		settling = true;
		dragTransition = prefersReducedMotion()
			? 'none'
			: `transform ${SNAP_MS}ms cubic-bezier(0.23, 1, 0.32, 1)`;
		dragY = 0;

		setTimeout(() => {
			settling = false;
			dragTransition = 'none';
		}, SNAP_MS);
	}

	function dismissByDrag(height: number) {
		settling = true;
		closingByDrag = true;
		const reduce = prefersReducedMotion();
		dragTransition = reduce ? 'none' : `transform ${DISMISS_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
		dragY = height + 48;

		if (closeTimer) clearTimeout(closeTimer);
		closeTimer = setTimeout(
			() => {
				closeTimer = null;
				if (closingByDrag) onClose();
			},
			reduce ? 0 : DISMISS_MS
		);
	}

	function handleClickCapture(e: MouseEvent) {
		if (!suppressClick) return;
		e.preventDefault();
		e.stopPropagation();
		suppressClick = false;
	}

	function handleOutroEnd() {
		dragY = 0;
		dragging = false;
		settling = false;
		dragTransition = 'none';
		closingByDrag = false;
		onClosed?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- The wrapper stays unanimated: fading a parent that contains a
	     backdrop-filter forces the blur to be recomposited every frame, which is
	     what makes the sheet stutter on phones. Each layer animates itself. -->
	<div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
		<!-- Backdrop -->
		<div
			class="absolute inset-0"
			style:opacity={backdropOpacity}
			style:transition={dragging
				? 'none'
				: `opacity ${settling ? SNAP_MS : 200}ms cubic-bezier(0.23, 1, 0.32, 1)`}
			aria-hidden="true"
		>
			<div
				class="absolute inset-0 bg-bg/80 backdrop-blur-md"
				onclick={onClose}
				aria-hidden="true"
				in:fade={{ duration: 180, easing: cubicOut }}
				out:fade={{ duration: 260, easing: cubicOut }}
			></div>
		</div>

		<!-- Drag wrapper: the sheet follows the finger on phones, while the
		     dialog's own enter/exit transition stays untouched underneath. -->
		<div
			bind:this={wrapperEl}
			class="relative w-full max-w-sm flex flex-col"
			style:transform={dragging || settling || dragY > 0
				? `translate3d(0, ${dragY}px, 0)`
				: undefined}
			style:transition={dragTransition}
			onclickcapture={handleClickCapture}
		>
			<!-- Modal content: a bottom sheet on phones, a centred dialog from sm up.
			     The body scrolls so long forms and the keyboard never push it off-screen. -->
			<div
				role="dialog"
				aria-modal="true"
				class="relative w-full bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85dvh] rounded-t-2xl sm:rounded-2xl border border-border/50"
				in:sheetIn
				out:sheetOut
				onoutroend={handleOutroEnd}
			>
				<!-- Sheet grabber. On phones this is a real 44px drag target; the
				     pill is just the visual cue. -->
				<div
					class="sm:hidden shrink-0 h-11 flex items-start justify-center pt-3 -mb-5 touch-none cursor-grab active:cursor-grabbing"
					aria-hidden="true"
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerCancel}
				>
					<div class="h-1 w-10 rounded-full bg-border-subtle/60"></div>
				</div>

				<button
					onclick={onClose}
					class="absolute top-2 right-2 z-20 p-3 text-text-muted hover:text-text hover:bg-surface-hover transition-colors rounded-full"
					aria-label="Close"
				>
					<CloseIcon class="h-5 w-5" />
				</button>

				<div
					class="w-full overflow-y-auto overscroll-contain flex flex-col items-center p-6 pt-8 pb-[calc(1.5rem+var(--safe-inset-bottom))] text-center sm:pt-12 sm:pb-6"
				>
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}
