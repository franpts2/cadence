<script lang="ts">
	import { getCalendarState, type Song } from '$lib';
	import Tooltip from '../ui/Tooltip.svelte';

	let { song, day }: { song: Song; day: number } = $props();
	const cal = getCalendarState();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		cal.openPreview(song);
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
	let startX = 0;
	let startY = 0;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		isTouchDragging = false;

		if (touchTimer) clearTimeout(touchTimer);

		touchTimer = setTimeout(() => {
			isTouchDragging = true;
			touchX = touch.clientX;
			touchY = touch.clientY;
			cal.draggingSong = song;
			cal.draggingFromDay = day;

			if (navigator.vibrate) {
				navigator.vibrate(50);
			}
		}, 500); // 500ms long press delay
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length !== 1) return;

		const touch = e.touches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;

		if (!isTouchDragging) {
			// If user moves finger significantly before long-press, cancel the timer
			if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
				if (touchTimer) {
					clearTimeout(touchTimer);
					touchTimer = null;
				}
			}
			return;
		}

		// Prevent scrolling once touch dragging has started
		if (e.cancelable) {
			e.preventDefault();
		}

		touchX = touch.clientX;
		touchY = touch.clientY;

		// Detect target under finger
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		if (element) {
			const dayCell = element.closest('[data-day]');
			if (dayCell) {
				const targetDay = parseInt(dayCell.getAttribute('data-day') || '');
				if (!isNaN(targetDay)) {
					cal.touchHoveredDay = targetDay;
				} else {
					cal.touchHoveredDay = null;
				}
			} else {
				cal.touchHoveredDay = null;
			}

			const navTarget = element.closest('[data-nav-target]');
			if (navTarget) {
				const direction = navTarget.getAttribute('data-nav-target') as 'prev' | 'next';
				cal.startDelayedNav(direction);
			} else {
				cal.cancelDelayedNav();
			}
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
		isTouchDragging = false;

		const touch = e.changedTouches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		if (element) {
			const dayCell = element.closest('[data-day]');
			if (dayCell) {
				const toDay = parseInt(dayCell.getAttribute('data-day') || '');
				if (!isNaN(toDay)) {
					cal.moveSong(day, toDay);
				}
			}
		}

		cal.draggingSong = null;
		cal.draggingFromDay = null;
		cal.touchHoveredDay = null;
		cal.cancelDelayedNav(true);
	}

	function handleTouchCancel() {
		if (touchTimer) {
			clearTimeout(touchTimer);
			touchTimer = null;
		}
		if (isTouchDragging) {
			isTouchDragging = false;
			cal.draggingSong = null;
			cal.draggingFromDay = null;
			cal.touchHoveredDay = null;
			cal.cancelDelayedNav(true);
		}
	}

	// Svelte action to bind touch events as non-passive
	function touchDraggable(node: HTMLElement) {
		node.addEventListener('touchstart', handleTouchStart, { passive: true });
		node.addEventListener('touchmove', handleTouchMove, { passive: false });
		node.addEventListener('touchend', handleTouchEnd, { passive: false });
		node.addEventListener('touchcancel', handleTouchCancel, { passive: true });

		return {
			destroy() {
				node.removeEventListener('touchstart', handleTouchStart);
				node.removeEventListener('touchmove', handleTouchMove);
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
		class="w-full flex flex-col items-center gap-1 text-center px-1 outline-none rounded-lg transition-all cursor-grab active:cursor-grabbing hover:bg-surface/50 {cal.draggingSong?.id === song.id && cal.draggingFromDay === day ? 'opacity-30' : ''}"
	>
		{#if song.album.images[0]}
			<div class="w-full max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] aspect-square overflow-hidden rounded-sm flex-shrink-0">
				<img src={song.album.images[0].url} alt="" class="w-full h-full object-cover" />
			</div>
		{/if}
		<span class="text-[9px] sm:text-[10px] text-accent-hover truncate font-medium w-full px-1">
			{song.name}
		</span>
	</button>
</Tooltip>

{#if isTouchDragging}
	<div 
		class="fixed pointer-events-none z-[9999] flex flex-col items-center gap-1.5 text-center bg-surface/95 border border-accent/30 rounded-lg p-2 shadow-2xl transition-transform duration-75 backdrop-blur-md"
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
