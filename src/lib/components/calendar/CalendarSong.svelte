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

	/** Move the floating ghost and find the day / nav zone under the finger. */
	function updateDrag(touch: Touch) {
		touchX = touch.clientX;
		touchY = touch.clientY;

		const element = document.elementFromPoint(touch.clientX, touch.clientY);
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

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		isTouchDragging = false;

		if (touchTimer) clearTimeout(touchTimer);

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
		if (Math.abs(touch.clientX - startX) > 8 || Math.abs(touch.clientY - startY) > 8) {
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
		isTouchDragging = false;
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

		resetDrag();
	}

	function handleTouchCancel() {
		if (touchTimer) {
			clearTimeout(touchTimer);
			touchTimer = null;
		}
		if (isTouchDragging) {
			resetDrag();
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
					class="w-full h-full object-cover select-none"
				/>
			</div>
		{/if}
		<span class="text-[9px] min-[380px]:text-[10px] leading-none sm:leading-normal text-accent-hover truncate font-medium w-full px-0.5">
			{song.name}
		</span>
	</button>
</Tooltip>

{#if isTouchDragging}
	<div 
		class="fixed pointer-events-none z-[9999] flex flex-col items-center gap-1.5 text-center bg-surface/95 border border-accent/30 rounded-lg p-2 shadow-2xl transition-transform duration-75 ease-out backdrop-blur-md"
		style="left: {touchX}px; top: {touchY}px; transform: translate(-50%, -120%); width: 80px;"
	>
		{#if song.album.images[0]}
			<div class="w-14 h-14 aspect-square overflow-hidden rounded-sm flex-shrink-0 shadow-md">
				<img src={song.album.images[0].url} alt="" class="w-full h-full object-cover" />
			</div>
		{/if}
		<span class="text-[9px] text-accent truncate font-medium w-full px-1">
			{song.name}
		</span>
	</div>
{/if}
