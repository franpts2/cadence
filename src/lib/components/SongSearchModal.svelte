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

	$effect(() => {
		if (isOpen && inputElement) {
			inputElement.focus();
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
		if (e.key === 'Escape') onClose();
		if (e.key === 'Enter') handleSearch();
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function debouncedSearch() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(handleSearch, 300);
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-xs"
		onclick={onClose}
	>
		<div 
			class="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-4 border-b border-zinc-800 flex items-center gap-3">
				<SearchIcon class="h-5 w-5 text-zinc-500" />
				<input
					bind:this={inputElement}
					bind:value={searchQuery}
					oninput={debouncedSearch}
					onkeydown={handleKeydown}
					placeholder="Search for a song..."
					class="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 text-lg"
				/>
				<button onclick={onClose} class="text-zinc-500 hover:text-zinc-300 p-1" aria-label="Close search">
					<CloseIcon />
				</button>
			</div>

			<div class="max-h-[60vh] overflow-y-auto">
				{#if isSearching && results.length === 0}
					<div class="p-8 text-center text-zinc-500">
						<div class="animate-pulse">Searching...</div>
					</div>
				{:else if results.length > 0}
					<div class="p-2">
						{#each results as song}
							<SongSearchResult {song} onclick={() => onSelect(song)} />
						{/each}
					</div>
				{:else if searchQuery && !isSearching}
					<div class="p-8 text-center text-zinc-600">
						No results found for "{searchQuery}"
					</div>
				{:else}
					<div class="p-12 text-center text-zinc-700">
						Start typing to search Spotify...
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
