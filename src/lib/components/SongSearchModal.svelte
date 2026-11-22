<script lang="ts">
	import { type Song, SearchIcon, CloseIcon, pop } from '$lib';
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
	let panelMaxHeight = $state<number | null>(null);

	// Keep the panel inside the *visible* viewport so the on-screen keyboard
	// shrinks the results list instead of resizing the whole page. The layout
	// viewport stays put (see `interactive-widget=resizes-visual`), so the
	// calendar behind the dialog does not reflow while the keyboard animates.
	function updateVisibleHeight() {
		if (!panelEl || typeof window === 'undefined') return;

		const viewport = window.visualViewport;
		if (!viewport) {
			panelMaxHeight = null;
			return;
		}

		const rect = panelEl.getBoundingClientRect();
		const topInView = Math.max(0, rect.top - viewport.offsetTop);
		const available = viewport.height - topInView - 16;

		panelMaxHeight = Math.max(160, Math.min(available, viewport.height * 0.84));
	}

	$effect(() => {
		if (!isOpen) {
			if (dialogElement?.open) dialogElement.close();
			panelMaxHeight = null;
			return;
		}

		if (!dialogElement) return;
		if (!dialogElement.open) dialogElement.showModal();

		// Focus synchronously so the keyboard opens reliably, but stop iOS from
		// panning the page to reveal the already-visible input. The viewport
		// measurement waits a frame for the dialog to be laid out.
		inputElement?.focus({ preventScroll: true });
		const frame = requestAnimationFrame(updateVisibleHeight);

		const viewport = window.visualViewport;
		const update = () => updateVisibleHeight();

		viewport?.addEventListener('resize', update);
		viewport?.addEventListener('scroll', update);
		window.addEventListener('resize', update);

		return () => {
			cancelAnimationFrame(frame);
			viewport?.removeEventListener('resize', update);
			viewport?.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
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
</script>

<dialog
	bind:this={dialogElement}
	onclose={handleClose}
	onclick={(e) => e.target === dialogElement && handleClose()}
	class="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 overscroll-contain backdrop:bg-bg/50 backdrop:backdrop-blur-sm"
>
	<div
		class="flex items-start justify-center pt-[calc(1rem+var(--safe-inset-top))] sm:pt-[15vh] px-3 sm:px-4 h-full w-full pointer-events-none"
	>
		<div
			bind:this={panelEl}
			class="search-panel w-full max-w-lg max-h-[84dvh] flex flex-col bg-surface border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
			role="document"
			style:max-height={panelMaxHeight ? `${panelMaxHeight}px` : undefined}
		>
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
					class="text-text-dim hover:text-accent-hover p-3 -m-2"
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
