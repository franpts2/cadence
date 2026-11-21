<script lang="ts">
	import { getCalendarState, type Song } from '$lib';
	import Tooltip from '../ui/Tooltip.svelte';

	let { song, day }: { song: Song; day: number } = $props();
	const cal = getCalendarState();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		cal.openPreview(song, day);
	}

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', day.toString());
			e.dataTransfer.effectAllowed = 'move';
			cal.draggingSong = song;
			cal.draggingFromDay = day;
		}
	}

	function handleDragEnd() {
		cal.draggingSong = null;
		cal.draggingFromDay = null;
	}

	// Mobile Touch Dragging Logic
	let isTouchDragging = $state(false);
	let touchX = $state(0);
	let touchY = $state(0);
	let touchTimer: ReturnType<typeof setTimeout> | null = null;
	let dragNode: HTMLElement | null = null;
	let startX = 0;
	let startY = 0;
	let lastPoint: { x: number; y: number } | null = null;
	let autoScrollFrame: number | null = null;
	let isDropping = $state(false);
	let dropTimer: ReturnType<typeof setTimeout> | null = null;

	// Auto-scroll near the top / bottom edge of the day grid. Without this a
	// drag cannot reach a day that is off-screen on a tall month.
	const EDGE_ZONE = 56;
	const MAX_SCROLL_SPEED = 14;

	/** Move the floating ghost and find the day / nav zone under the finger. */
	function updateDrag(touch: Touch) {
		lastPoint = { x: touch.clientX, y: touch.clientY };
		touchX = touch.clientX;
		touchY = touch.clientY;
		refreshHover(lastPoint);
		scheduleAutoScroll();
	}

	function refreshHover(point: { x: number; y: number }) {
		const element = document.elementFromPoint(point.x, point.y);
		if (!element) return;

		const dayCell = element.closest('[data-day]');
		const targetDay = dayCell ? parseInt(dayCell.getAttribute('data-day') || '') : NaN;
		cal.touchHoveredDay = Number.isNaN(targetDay) ? null : targetDay;

		const navTarget = element.closest('[data-nav-target]');
		if (navTarget) {
			cal.startDelayedNav(navTarget.getAttribute('data-nav-target') as 'prev' | 'next');
		} else {
			cal.cancelDelayedNav();
		}
	}

	function scheduleAutoScroll() {
		if (autoScrollFrame !== null || !isTouchDragging) return;
		autoScrollFrame = requestAnimationFrame(autoScrollStep);
	}

	function autoScrollStep() {
		autoScrollFrame = null;
		if (!isTouchDragging || !lastPoint) return;

		const scroller = dragNode?.closest('[data-calendar-scroll]') as HTMLElement | null;
		if (!scroller) return;

		const rect = scroller.getBoundingClientRect();
		let delta = 0;

		if (lastPoint.y < rect.top + EDGE_ZONE) {
			delta = -((rect.top + EDGE_ZONE - lastPoint.y) / EDGE_ZONE) * MAX_SCROLL_SPEED;
		} else if (lastPoint.y > rect.bottom - EDGE_ZONE) {
			delta = ((lastPoint.y - (rect.bottom - EDGE_ZONE)) / EDGE_ZONE) * MAX_SCROLL_SPEED;
		}

		if (Math.abs(delta) < 0.5) return;

		const before = scroller.scrollTop;
		scroller.scrollTop = before + delta;
		if (scroller.scrollTop === before) return;

		// The content moved under a stationary finger, so re-hit-test.
		refreshHover(lastPoint);
		autoScrollFrame = requestAnimationFrame(autoScrollStep);
	}

	function stopAutoScroll() {
		if (autoScrollFrame !== null) {
			cancelAnimationFrame(autoScrollFrame);
			autoScrollFrame = null;
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		isTouchDragging = false;
		isDropping = false;

		if (touchTimer) clearTimeout(touchTimer);
		if (dropTimer) {
			clearTimeout(dropTimer);
			dropTimer = null;
		}

		touchTimer = setTimeout(() => {
			isTouchDragging = true;
			updateDrag(touch);
			cal.draggingSong = song;
			cal.draggingFromDay = day;

			// Only a live drag needs preventDefault on touchmove, so the non-passive
			// listener is attached now instead of up front. Every other touch on a
			// song stays passive, which is what keeps the grid scrolling smoothly.
			dragNode?.removeEventListener('touchmove', handleTouchMove);
			dragNode?.addEventListener('touchmove', handleDragMove, { passive: false });

			if (navigator.vibrate) {
				navigator.vibrate(50);
			}
		}, 350); // long-press delay — long enough to not fire on a scroll, short enough to feel native
	}

	// Before the long press: passive, and only watching for movement that cancels it.
	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		// A little more slack than the old 8px: finger jitter on a real phone
		// could cancel the long press before it ever became a drag.
		if (Math.abs(touch.clientX - startX) > 12 || Math.abs(touch.clientY - startY) > 12) {
			if (touchTimer) {
				clearTimeout(touchTimer);
				touchTimer = null;
			}
		}
	}

	// During a drag: the only listener allowed to cancel the browser's scroll.
	function handleDragMove(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		if (e.cancelable) e.preventDefault();
		updateDrag(e.touches[0]);
	}

	function resetDrag() {
		stopAutoScroll();
		lastPoint = null;
		isTouchDragging = false;
		isDropping = false;
		if (dropTimer) {
			clearTimeout(dropTimer);
			dropTimer = null;
		}
		cal.draggingSong = null;
		cal.draggingFromDay = null;
		cal.touchHoveredDay = null;
		cal.cancelDelayedNav(true);

		if (dragNode) {
			dragNode.removeEventListener('touchmove', handleDragMove);
			dragNode.addEventListener('touchmove', handleTouchMove, { passive: true });
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (touchTimer) {
			clearTimeout(touchTimer);
			touchTimer = null;
		}

		if (!isTouchDragging) return;

		// Prevent emulated click event
		e.preventDefault();

		const touch = e.changedTouches[0];
		const dayCell = document
			.elementFromPoint(touch.clientX, touch.clientY)
			?.closest('[data-day]');
		const toDay = dayCell ? parseInt(dayCell.getAttribute('data-day') || '') : NaN;
		if (!Number.isNaN(toDay)) {
			cal.moveSong(day, toDay);
		}

		finishDrag();
	}

	// Release phase: the ghost keeps its position for one short beat while it
	// fades and shrinks, instead of blinking out the instant the finger lifts.
	function finishDrag() {
		stopAutoScroll();
		isTouchDragging = false;
		isDropping = true;

		// Stop treating further movement as a drag immediately, even while the
		// drop animation is still playing.
		if (dragNode) {
			dragNode.removeEventListener('touchmove', handleDragMove);
			dragNode.addEventListener('touchmove', handleTouchMove, { passive: true });
		}

		if (dropTimer) clearTimeout(dropTimer);
		dropTimer = setTimeout(() => {
			dropTimer = null;
			resetDrag();
		}, 150);
	}

	function handleTouchCancel() {
		if (touchTimer) {
			clearTimeout(touchTimer);
			touchTimer = null;
		}
		if (isTouchDragging) {
			finishDrag();
		}
	}

	// Svelte action to bind touch events. `touchmove` starts passive and is
	// swapped for a non-passive one only while a drag is actually running.
	function touchDraggable(node: HTMLElement) {
		dragNode = node;
		node.addEventListener('touchstart', handleTouchStart, { passive: true });
		node.addEventListener('touchmove', handleTouchMove, { passive: true });
		node.addEventListener('touchend', handleTouchEnd, { passive: false });
		node.addEventListener('touchcancel', handleTouchCancel, { passive: true });

		return {
			destroy() {
				stopAutoScroll();
				if (dropTimer) clearTimeout(dropTimer);
				dragNode = null;
				node.removeEventListener('touchstart', handleTouchStart);
				node.removeEventListener('touchmove', handleTouchMove);
				node.removeEventListener('touchmove', handleDragMove);
				node.removeEventListener('touchend', handleTouchEnd);
				node.removeEventListener('touchcancel', handleTouchCancel);
			}
		};
	}
</script>

<Tooltip text={"Click to open song details\nDrag to change the day"}>
	<button 
		use:touchDraggable
		onclick={handleClick}
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
		draggable="true"
		class="w-full flex flex-col items-center gap-0.5 text-center outline-none rounded-lg transition-[background-color,opacity] cursor-grab active:cursor-grabbing touch-pan-y hover:bg-surface/50 {cal.draggingSong?.id === song.id && cal.draggingFromDay === day ? 'opacity-30' : ''}"
	>
		{#if song.album.images[0]}
			<div class="calendar-cover w-full max-w-[2.75rem] min-[380px]:max-w-[3.5rem] sm:max-w-[4rem] md:max-w-[5rem] aspect-square overflow-hidden rounded-sm flex-shrink-0">
				<img
					src={song.album.images[0].url}
					alt=""
					draggable="false"
					loading="lazy"
					decoding="async"
					fetchpriority="low"
					class="w-full h-full object-cover select-none"
				/>
			</div>
		{/if}
		<span class="text-[9px] min-[380px]:text-[10px] leading-none sm:leading-normal text-accent-hover truncate font-medium w-full px-0.5">
			{song.name}
		</span>
	</button>
</Tooltip>

{#if isTouchDragging || isDropping}
	<!-- Follows the finger. Positioned with translate3d on a fixed origin so each
	     move is a compositor-only change, and deliberately untransitioned so it
	     tracks the finger instead of trailing 75ms behind it. No backdrop-filter:
	     re-blurring a moving layer is what makes the drag stutter on phones. -->
	<div
		class="drag-ghost fixed top-0 left-0 pointer-events-none z-[9999] flex flex-col items-center gap-1.5 text-center bg-surface border border-accent/30 rounded-lg p-2 shadow-2xl will-change-transform"
		class:dropping={isDropping}
		style="transform: translate3d({touchX}px, {touchY}px, 0) translate(-50%, -120%); width: 80px;"
	>
		{#if song.album.images[0]}
			<div class="w-14 h-14 aspect-square overflow-hidden rounded-sm flex-shrink-0 shadow-md">
				<img src={song.album.images[0].url} alt="" decoding="async" class="w-full h-full object-cover" />
			</div>
		{/if}
		<span class="text-[9px] text-accent truncate font-medium w-full px-1">
			{song.name}
		</span>
	</div>
{/if}

<style>
	.drag-ghost {
		opacity: 1;
		scale: 1;
		transition:
			opacity 140ms cubic-bezier(0.23, 1, 0.32, 1),
			scale 140ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	@starting-style {
		.drag-ghost {
			opacity: 0;
			scale: 0.88;
		}
	}

	.drag-ghost.dropping {
		opacity: 0;
		scale: 0.9;
	}

	@media (prefers-reduced-motion: reduce) {
		.drag-ghost {
			transition: none;
		}

		@starting-style {
			.drag-ghost {
				opacity: 1;
				scale: 1;
			}
		}

		.drag-ghost.dropping {
			opacity: 0;
			scale: 1;
		}
	}
</style>
