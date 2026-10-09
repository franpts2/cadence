<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import Select from './ui/Select.svelte';
	import Alert from './ui/Alert.svelte';
	import NumberInput from './ui/NumberInput.svelte';
	import LoadingIndicator from './ui/LoadingIndicator.svelte';
	import { getCalendarState, MONTHS } from '$lib';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { signIn, signOut } from '@auth/sveltekit/client';

	const cal = getCalendarState();

	let exportType = $state<'monthly' | 'yearly' | 'all'>('monthly');
	let year = $state(cal.viewDate.getFullYear());
	let month = $state(cal.viewDate.getMonth());
	let isExporting = $state(false);
	let exportedUrl = $state<string | null>(null);
	let needsReconnect = $state(false);
	let isReconnecting = $state(false);

	const exportTypeOptions = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' },
		{ value: 'all', label: 'All Time' }
	];

	const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));

	function reset() {
		exportType = 'monthly';
		year = cal.viewDate.getFullYear();
		month = cal.viewDate.getMonth();
		exportedUrl = null;
		needsReconnect = false;
	}

	async function handleExport(e: SubmitEvent) {
		e.preventDefault();

		if (isExporting) return;

		isExporting = true;

		try {
			const payload: Record<string, unknown> = { exportType };

			if (exportType === 'monthly' || exportType === 'yearly') {
				payload.year = year;
			}
			if (exportType === 'monthly') {
				payload.month = month;
			}

			const response = await fetch('/api/songs/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.code === 'AUTH_EXPIRED') {
					cal.addToast(data.error || 'Spotify session expired. Please log in again.', 'error');
				} else if (data.code === 'SCOPE_MISSING') {
					needsReconnect = true;
				} else {
					cal.addToast(data.error || 'Failed to export playlist', 'error');
				}
				return;
			}

			exportedUrl = data.playlistUrl;
			cal.addToast(`Exported ${data.count} songs to "${data.playlistName}"`, 'success');
		} catch (err) {
			console.error('Export error:', err);
			cal.addToast('An unexpected error occurred during export.', 'error');
		} finally {
			isExporting = false;
		}
	}

	async function handleReconnect() {
		if (isReconnecting) return;
		isReconnecting = true;
		try {
			await signOut({ redirect: false });
			await signIn('spotify');
		} catch (err) {
			console.error('Reconnect error:', err);
			isReconnecting = false;
			cal.addToast('Could not reconnect to Spotify. Please try again.', 'error');
		}
	}

	function handleClose() {
		cal.closeExport();
		setTimeout(reset, 200);
	}
</script>

<Modal isOpen={cal.isExportOpen} onClose={handleClose}>
	{#if isExporting}
		<LoadingIndicator />
	{/if}

	<h2 class="text-2xl font-semibold text-text mb-2">Export Playlist</h2>
	<p class="text-sm text-text-muted mb-6">
		Create a private Spotify playlist from your calendar entries.
	</p>

	{#if exportedUrl}
		<div class="w-full space-y-4" in:fade={{ duration: 180, easing: cubicOut }}>
			<Alert title="Export Complete" variant="success">
				<p>Your playlist was created successfully on Spotify.</p>
			</Alert>

			<a
				href={exportedUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="block w-full px-4 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-bg font-bold rounded-xl text-center transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				Open Playlist on Spotify
			</a>

			<button
				type="button"
				onclick={handleClose}
				class="w-full px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl font-medium transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				Close
			</button>
		</div>
	{:else if needsReconnect}
		<div class="w-full space-y-4" in:fade={{ duration: 180, easing: cubicOut }}>
			<Alert title="Spotify Permission Needed" variant="warning">
				<p>
					Cadence needs permission to create playlists. Reconnect your Spotify account to grant it.
				</p>
				<p class="mt-2">
					This signs you out and back in. If the Spotify prompt doesn't ask for playlist access, remove Cadence from your Spotify account's apps and reconnect.
				</p>
			</Alert>

			<button
				type="button"
				onclick={handleReconnect}
				disabled={isReconnecting}
				class="w-full px-4 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-bg font-bold rounded-xl disabled:opacity-50 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				{isReconnecting ? 'Reconnecting...' : 'Reconnect Spotify'}
			</button>

			<button
				type="button"
				onclick={handleClose}
				disabled={isReconnecting}
				class="w-full px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl font-medium disabled:opacity-50 transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				Cancel
			</button>
		</div>
	{:else}
		<form onsubmit={handleExport} class="w-full space-y-4 text-left">
			<div class="space-y-4 {isExporting ? 'opacity-50 pointer-events-none' : ''}">
				<div class="grid grid-cols-2 gap-4">
					<div class={exportType === 'all' ? 'col-span-2' : ''}>
						<label for="export-type" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
							Export Type
						</label>
						<Select id="export-type" bind:value={exportType} options={exportTypeOptions} />
					</div>
					{#if exportType !== 'all'}
						<div>
							<label for="export-year" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
								Year
							</label>
							<NumberInput id="export-year" bind:value={year} min={2000} max={2100} />
						</div>
					{/if}
				</div>

				{#if exportType === 'monthly'}
					<div transition:fade={{ duration: 150, easing: cubicOut }}>
						<label for="export-month" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
							Month
						</label>
						<Select id="export-month" bind:value={month} options={monthOptions} />
					</div>
				{/if}

				<Alert title="Important Note" variant="info">
					<p>
						A <strong>private</strong> playlist will be created in your Spotify account. Songs are ordered by date, from oldest to newest.
					</p>
					<p class="mt-2">
						If this is your first export, you may be asked to log in again to grant playlist creation permission.
					</p>
				</Alert>
			</div>

			<div class="flex gap-3">
				<button
					type="button"
					onclick={handleClose}
					disabled={isExporting}
					class="flex-1 px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl font-medium disabled:opacity-50 transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isExporting}
					class="flex-1 px-4 py-2.5 bg-text text-bg hover:bg-white rounded-xl font-bold disabled:opacity-50 transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
				>
					{isExporting ? 'Exporting...' : 'Export Playlist'}
				</button>
			</div>
		</form>
	{/if}
</Modal>
