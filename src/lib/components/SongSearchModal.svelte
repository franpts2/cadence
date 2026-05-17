<script lang="ts">
	import { type Song, SearchIcon, CloseIcon } from '$lib';
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
</script>

<dialog
	bind:this={dialogElement}
	onclose={handleClose}
	onclick={(e) => e.target === dialogElement && handleClose()}
	class="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 backdrop:bg-bg/50 backdrop:backdrop-blur-sm"
>
	<div class="flex items-start justify-center pt-[15vh] px-4 h-full w-full pointer-events-none">
		<div 
			class="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
			role="document"
		>
			<div class="p-4 border-b border-border flex items-center gap-3">
				<SearchIcon class="h-5 w-5 text-text-dim" />
				<input
					bind:this={inputElement}
					bind:value={searchQuery}
					oninput={debouncedSearch}
					onkeydown={handleKeydown}
					placeholder="Search for a song..."
					class="flex-1 bg-transparent border-none outline-none text-text placeholder:text-text-subtle text-lg"
				/>
				<button 
					onclick={handleClose} 
					class="text-text-dim hover:text-accent-hover p-1" 
					aria-label="Close search"
				>
					<CloseIcon />
				</button>
			</div>

			<div class="max-h-[60vh] overflow-y-auto">
				{#if isSearching && results.length === 0}
					<div class="p-8 text-center text-text-dim">
						<div class="animate-pulse">Searching...</div>
					</div>
				{:else if results.length > 0}
					<div class="p-2">
						{#each results as song}
							<SongSearchResult {song} onclick={() => onSelect(song)} />
						{/each}
					</div>
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
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
