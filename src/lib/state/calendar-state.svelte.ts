import { getContext, setContext } from 'svelte';
import type { Song, Toast, ToastType } from '../types/index';
import { getDateKey, MONTHS } from '../utils/date';

export class CalendarState {
	today = new Date();
	viewDate = $state(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
	selectedDate = $state(this.today);
	
	// Song storage: key is "YYYY-MM-DD"
	songsPerDay = $state<Record<string, Song>>({});
	
	// Cache: keep track of which YYYY-MM have been loaded
	loadedMonths = new Set<string>();
	
	// UI State
	isLoading = $state(false);
	toasts = $state<Toast[]>([]);
	
	// Modal state
	isSearchOpen = $state(false);
	isImportOpen = $state(false);
	searchingForDate = $state<Date | null>(null);
	previewingSong = $state<Song | null>(null);

	monthLabel = $derived(MONTHS[this.viewDate.getMonth()]);
	yearLabel = $derived(this.viewDate.getFullYear());

	constructor(initialSongs: Record<string, Song> = {}) {
		this.songsPerDay = initialSongs;
		if (Object.keys(initialSongs).length > 0) {
			const key = `${this.today.getFullYear()}-${this.today.getMonth() + 1}`;
			this.loadedMonths.add(key);
		}
	}

	// Preview Logic
	openPreview = (song: Song) => {
		this.previewingSong = song;
	};

	closePreview = () => {
		this.previewingSong = null;
	};

	// Toast Logic
	addToast = (message: string, type: ToastType = 'info') => {
		const id = crypto.randomUUID();
		this.toasts.push({ id, message, type });
		setTimeout(() => this.removeToast(id), 5000);
	};

	removeToast = (id: string) => {
		this.toasts = this.toasts.filter(t => t.id !== id);
	};

	prevMonth = () => {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
	};

	nextMonth = () => {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
	};

	goToToday = () => {
		this.viewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
		this.selectedDate = this.today;
	};

	selectDate = (day: number) => {
		this.selectedDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
	};

	startSearchForDay = (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		this.openSearch(date);
	};

	getSongsForDay = (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		const song = this.songsPerDay[getDateKey(date)];
		return song ? [song] : [];
	};

	openSearch = (date: Date) => {
		this.searchingForDate = date;
		this.isSearchOpen = true;
	};

	closeSearch = () => {
		this.isSearchOpen = false;
		this.searchingForDate = null;
	};

	openImport = () => {
		this.isImportOpen = true;
	};

	closeImport = () => {
		this.isImportOpen = false;
	};

	loadSongs = async () => {
		const year = this.viewDate.getFullYear();
		const month = this.viewDate.getMonth() + 1;
		const cacheKey = `${year}-${month}`;

		if (this.loadedMonths.has(cacheKey)) return;

		this.isLoading = true;
		try {
			const response = await fetch(`/api/songs?year=${year}&month=${month}`);
			if (response.ok) {
				const dbSongs: any[] = await response.json();
				const mapped = this.mapDbSongsToRecord(dbSongs);
				this.songsPerDay = { ...this.songsPerDay, ...mapped };
				this.loadedMonths.add(cacheKey);
			} else {
				this.addToast('Failed to load songs', 'error');
			}
		} catch (err) {
			console.error('Failed to load songs:', err);
			this.addToast('Network error while loading songs', 'error');
		} finally {
			this.isLoading = false;
		}
	};

	mapDbSongsToRecord = (dbSongs: any[]): Record<string, Song> => {
		const mapped: Record<string, Song> = {};
		dbSongs.forEach((s) => {
			mapped[s.dateKey] = {
				id: s.songId,
				name: s.songName,
				artists: [{ name: s.artistName }],
				album: {
					name: s.albumName,
					images: s.albumImageUrl ? [{ url: s.albumImageUrl }] : []
				},
				duration_ms: 0
			};
		});
		return mapped;
	};

	addSongToDate = async (date: Date, song: Song) => {
		const dateKey = getDateKey(date);
		this.isLoading = true;
		
		try {
			const response = await fetch('/api/songs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dateKey, song })
			});

			if (response.ok) {
				this.songsPerDay[dateKey] = song;
				this.addToast('Song saved to calendar', 'success');
			} else {
				const data = await response.json();
				this.addToast(data.error || 'Failed to save song', 'error');
			}
		} catch (err) {
			console.error('Failed to persist song:', err);
			this.addToast('Network error while saving', 'error');
		} finally {
			this.isLoading = false;
			this.closeSearch();
		}
	};

	removeSongFromDate = async (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		const dateKey = getDateKey(date);
		this.isLoading = true;

		try {
			const response = await fetch(`/api/songs?dateKey=${dateKey}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				delete this.songsPerDay[dateKey];
				this.addToast('Song removed', 'info');
			} else {
				this.addToast('Failed to remove song', 'error');
			}
		} catch (err) {
			console.error('Failed to delete song:', err);
			this.addToast('Network error while removing', 'error');
		} finally {
			this.isLoading = false;
		}
	};
}

const CALENDAR_KEY = Symbol('calendar');

export function setCalendarState(initialSongs?: Record<string, Song>) {
	return setContext(CALENDAR_KEY, new CalendarState(initialSongs));
}

export function getCalendarState() {
	return getContext<CalendarState>(CALENDAR_KEY);
}
