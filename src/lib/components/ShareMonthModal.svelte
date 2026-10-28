<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import { getCalendarState, MONTHS, ShareIcon, type Song } from '$lib';
	import {
		getShareFilename,
		renderShareImage,
		SHARE_IMAGE_HEIGHT,
		SHARE_IMAGE_WIDTH
	} from '$lib/utils/share-image';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	const cal = getCalendarState();

	let status = $state<'rendering' | 'ready' | 'error'>('rendering');
	let blob = $state<Blob | null>(null);
	let previewUrl = $state<string | null>(null);
	let canShareFiles = $state(false);
	let isSharing = $state(false);
	let renderToken = 0;

	const monthName = $derived(MONTHS[cal.viewDate.getMonth()]);
	const year = $derived(cal.viewDate.getFullYear());
	const filename = $derived(getShareFilename(year, cal.viewDate.getMonth()));

	onMount(() => {
		// Probe with a throwaway file, because `canShare` needs the real payload
		// shape to answer honestly.
		try {
			const probe = new File([new Blob(['x'])], 'probe.png', { type: 'image/png' });
			canShareFiles =
				typeof navigator.share === 'function' &&
				typeof navigator.canShare === 'function' &&
				navigator.canShare({ files: [probe] });
		} catch {
			canShareFiles = false;
		}
	});

	// Regenerate whenever the open modal's month or its songs change. The token
	// discards a render that a newer one has already superseded.
	$effect(() => {
		if (!cal.isShareOpen) return;

		const viewYear = cal.viewDate.getFullYear();
		const viewMonth = cal.viewDate.getMonth();
		const songs = $state.snapshot(cal.songsPerDay);

		void generate(viewYear, viewMonth, songs);
	});

	async function generate(
		viewYear: number,
		viewMonth: number,
		songs: Record<string, Song>
	) {
		const token = ++renderToken;
		status = 'rendering';
		isSharing = false;

		try {
			const image = await renderShareImage({ year: viewYear, month: viewMonth, songs });
			if (token !== renderToken) return;

			if (previewUrl) URL.revokeObjectURL(previewUrl);
			blob = image;
			previewUrl = URL.createObjectURL(image);
			status = 'ready';
		} catch (err) {
			if (token !== renderToken) return;
			console.error('Failed to render share image:', err);
			status = 'error';
		}
	}

	function retry() {
		void generate(year, cal.viewDate.getMonth(), $state.snapshot(cal.songsPerDay));
	}

	async function share() {
		if (!blob || isSharing) return;

		const file = new File([blob], filename, { type: 'image/png' });

		if (!canShareFiles) {
			download();
			return;
		}

		isSharing = true;
		try {
			await navigator.share({
				files: [file],
				title: `${monthName} ${year} · Cadence`,
				text: `My ${monthName} in Cadence`
			});
		} catch (err) {
			// Dismissing the sheet is not an error; only fall back when sharing
			// itself failed.
			if (err instanceof Error && err.name !== 'AbortError') {
				console.error('Share failed:', err);
				download();
			}
		} finally {
			isSharing = false;
		}
	}

	function download() {
		if (!blob) return;

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);

		cal.addToast('Image saved', 'success');
	}

	function reset() {
		// The exit animation can finish after a quick reopen; don't tear down a
		// render the user is already looking at.
		if (cal.isShareOpen) return;

		renderToken++;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		blob = null;
		status = 'rendering';
		isSharing = false;
	}
</script>

<Modal isOpen={cal.isShareOpen} onClose={cal.closeShare} onClosed={reset}>
	<h2 class="text-2xl font-semibold text-text mb-1">Share your month</h2>
	<p class="text-sm text-text-muted mb-5">
		A snapshot of {monthName} {year} — just the calendar.
	</p>

	<div
		class="relative w-full max-w-[320px] aspect-[4/5] rounded-xl overflow-hidden border border-border bg-bg mb-2"
	>
		{#if status === 'ready' && previewUrl}
			<img
				src={previewUrl}
				alt="{monthName} {year} calendar"
				class="w-full h-full object-cover"
				in:fade={{ duration: 220, easing: cubicOut }}
			/>
		{:else if status === 'error'}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-text-muted">
				<span class="text-sm">Could not create the image.</span>
				<button
					type="button"
					onclick={retry}
					class="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-surface-hover transition-colors"
				>
					Try again
				</button>
			</div>
		{:else}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-3">
				<div class="w-6 h-6 border-2 border-text-dim border-t-text rounded-full animate-spin"></div>
				<span class="text-[10px] font-medium text-text-dim uppercase tracking-widest">
					Creating
				</span>
			</div>
		{/if}
	</div>

	{#if status !== 'error'}
		<p class="text-[10px] text-text-dim mb-5 tracking-wide">
			{SHARE_IMAGE_WIDTH} × {SHARE_IMAGE_HEIGHT} · PNG
		</p>
	{:else}
		<div class="mb-5"></div>
	{/if}

	<div class="flex gap-3 w-full">
		{#if canShareFiles}
			<button
				type="button"
				onclick={share}
				disabled={status !== 'ready' || isSharing}
				class="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-text text-bg hover:bg-white rounded-xl font-bold disabled:opacity-50 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				<ShareIcon class="h-4 w-4" />
				{isSharing ? 'Sharing…' : 'Share image'}
			</button>

			<button
				type="button"
				onclick={download}
				disabled={status !== 'ready'}
				class="flex-1 px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl font-medium disabled:opacity-50 transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				Save
			</button>
		{:else}
			<button
				type="button"
				onclick={download}
				disabled={status !== 'ready'}
				class="flex-1 px-4 py-2.5 bg-text text-bg hover:bg-white rounded-xl font-bold disabled:opacity-50 transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:active:scale-100"
			>
				Save image
			</button>
		{/if}
	</div>
</Modal>
