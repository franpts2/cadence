<script lang="ts">
	import { type Song, SearchIcon, CloseIcon, pop, prefersReducedMotion } from '$lib';
	import SongSearchResult from './SongSearchResult.svelte';

	let { isOpen, onSelect, onClose } = $props<{
		isOpen: boolean;
		onSelect: (song: Song) => void;
		onClose: () => void;
	}>();

	let searchQuery = $state('');
	let results = $state<Song[]>([]);
	let isSearching = $state(false);
	let inputElement = $state<HTMLInputElement>();
	let dialogElement = $state<HTMLDialogElement>();
	let panelEl = $state<HTMLElement>();

	$effect(() => {
		if (isOpen) {
			dialogElement?.showModal();
			inputElement?.focus();
		} else {
			dialogElement?.close();
		}
	});

	async function handleSearch() {
		if (!searchQuery.trim()) {
			results = [];
			return;
		}

		isSearching = true;
		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
			if (response.ok) {
				results = await response.json();
			}
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isSearching = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function debouncedSearch() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(handleSearch, 300);
	}

	function handleClose() {
		searchQuery = '';
		results = [];
		onClose();
	}

	// Phone-only drag-to-dismiss. The panel is anchored to the top, so pulling
	// it down is the natural way to put it away without reaching for the X.
	let dragY = $state(0);
	let dragging = $state(false);
	let settling = $state(false);
	let dragTransition = $state('none');
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let lastY = 0;
	let lastTime = 0;
	let velocity = 0;
	let moved = false;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;

	function isPhone() {
		return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
	}

	function resetDrag() {
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
		dragY = 0;
		dragging = false;
		settling = false;
		dragTransition = 'none';
	}

	$effect(() => {
		if (!isOpen) resetDrag();
	});

	function handlePointerDown(e: PointerEvent) {
		if (!isPhone() || settling || e.button !== 0) return;

		dragging = true;
		moved = false;
		pointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		lastY = e.clientY;
		lastTime = performance.now();
		velocity = 0;
		dragY = 0;
		dragTransition = 'none';

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || e.pointerId !== pointerId) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!moved) {
			if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
			if (Math.abs(dx) > Math.abs(dy) * 1.2) {
				stopTracking();
				return;
			}
			moved = true;
		}

		if (e.cancelable) e.preventDefault();
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
		if (performance.now() - lastTime > 80) velocity = 0;

		const height = panelEl?.offsetHeight ?? 400;
		if (dragY > height * 0.25 || velocity > 500) {
			dismissByDrag();
		} else {
			settling = true;
			dragTransition = prefersReducedMotion()
				? 'none'
				: 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)';
			dragY = 0;
			setTimeout(() => {
				settling = false;
				dragTransition = 'none';
			}, 220);
		}
	}

	function handlePointerCancel() {
		if (!dragging) return;
		stopTracking();
		settling = true;
		dragTransition = prefersReducedMotion()
			? 'none'
			: 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)';
		dragY = 0;
	}

	function stopTracking() {
		if (pointerId !== null) {
			try {
				panelEl?.releasePointerCapture(pointerId);
			} catch {
				// Pointer already gone.
			}
		}
		pointerId = null;
		dragging = false;
	}

	function dismissByDrag() {
		settling = true;
		const reduce = prefersReducedMotion();
		const distance = (panelEl?.offsetHeight ?? 400) + 24;
		dragTransition = reduce ? 'none' : 'transform 170ms cubic-bezier(0.4, 0, 1, 1)';
		dragY = distance;

		if (closeTimer) clearTimeout(closeTimer);
		closeTimer = setTimeout(
			() => {
				closeTimer = null;
				handleClose();
			},
			reduce ? 0 : 160
		);
	}
</script>

<dialog
	bind:this={dialogElement}
	onclose={handleClose}
	onclick={(e) => e.target === dialogElement && handleClose()}
	class="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 overscroll-contain backdrop:bg-bg/50 backdrop:backdrop-blur-sm"
>
	<div class="flex items-start justify-center pt-[8dvh] sm:pt-[15vh] px-3 sm:px-4 h-full w-full pointer-events-none">
		<div
			bind:this={panelEl}
			class="w-full max-w-lg flex flex-col pointer-events-auto"
			style:transform={dragging || settling || dragY > 0
				? `translate3d(0, ${dragY}px, 0)`
				: undefined}
			style:transition={dragTransition}
		>
			<div
				class="search-panel w-full max-h-[84dvh] flex flex-col bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
				role="document"
			>
				<!-- Drag handle for phones. The input stays a tap/type target. -->
				<div
					class="sm:hidden shrink-0 h-11 flex items-start justify-center pt-3 -mb-3 touch-none cursor-grab active:cursor-grabbing"
					aria-hidden="true"
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerCancel}
				>
					<div class="h-1 w-10 rounded-full bg-border-subtle/60"></div>
				</div>

				<div class="p-4 border-b border-border flex items-center gap-3 shrink-0">
					<SearchIcon class="h-5 w-5 text-text-dim" />
					<input
						bind:this={inputElement}
						bind:value={searchQuery}
						oninput={debouncedSearch}
						onkeydown={handleKeydown}
						type="search"
						inputmode="search"
						enterkeyhint="search"
						autocapitalize="none"
						autocorrect="off"
						spellcheck="false"
						placeholder="Search for a song..."
						aria-label="Search for a song"
						class="flex-1 min-w-0 bg-transparent border-none outline-none text-text placeholder:text-text-subtle text-base sm:text-lg"
					/>
					<button
						onclick={handleClose}
						class="text-text-dim hover:text-accent-hover p-2 -m-1"
						aria-label="Close search"
					>
						<CloseIcon />
					</button>
				</div>

				<div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
					{#if isSearching && results.length === 0}
						<div class="p-8 text-center text-text-dim">
							<div class="animate-pulse">Searching...</div>
						</div>
					{:else if results.length > 0}
						{#key results}
							<div class="p-2" in:pop={{ duration: 120, start: 1 }}>
								{#each results as song}
									<SongSearchResult {song} onclick={() => onSelect(song)} />
								{/each}
							</div>
						{/key}
					{:else if searchQuery && !isSearching}
						<div class="p-8 text-center text-text-subtle">
							No results found for "{searchQuery}"
						</div>
					{:else}
						<div class="p-12 text-center text-border-subtle">
							Start typing to search Spotify...
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		opacity: 1;
		transition: opacity 180ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	.search-panel {
		transition:
			opacity 150ms cubic-bezier(0.23, 1, 0.32, 1),
			transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
	}

	@starting-style {
		dialog::backdrop {
			opacity: 0;
		}

		.search-panel {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-panel {
			transition: opacity 150ms cubic-bezier(0.23, 1, 0.32, 1);
		}

		@starting-style {
			.search-panel {
				opacity: 0;
				transform: none;
			}
		}
	}
</style>
