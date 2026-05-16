import { getContext, setContext } from 'svelte';
import type { Song, DbSong } from '../types';
import { getDateKey, MONTHS } from '../utils/date';

export class CalendarState {
	today = new Date();
	viewDate = $state(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
	selectedDate = $state(this.today);
	
	// Song storage: key is "YYYY-MM-DD"
	songsPerDay = $state<Record<string, Song>>({});
	
	// Cache: keep track of which YYYY-MM have been loaded
	loadedMonths = new Set<string>();
	
	// Modal state
	isSearchOpen = $state(false);
	searchingForDate = $state<Date | null>(null);

	monthLabel = $derived(MONTHS[this.viewDate.getMonth()]);
	yearLabel = $derived(this.viewDate.getFullYear());

	constructor(initialSongs: Record<string, Song> = {}) {
		this.songsPerDay = initialSongs;
		// Mark current month as loaded if initial songs provided
		if (Object.keys(initialSongs).length > 0) {
			const key = `${this.today.getFullYear()}-${this.today.getMonth() + 1}`;
			this.loadedMonths.add(key);
		}
	}

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

	loadSongs = async () => {
		const year = this.viewDate.getFullYear();
		const month = this.viewDate.getMonth() + 1;
		const cacheKey = `${year}-${month}`;

		// Check if we've already loaded this month
		if (this.loadedMonths.has(cacheKey)) {
			return;
		}

		try {
			const response = await fetch(`/api/songs?year=${year}&month=${month}`);
			if (response.ok) {
				const dbSongs: DbSong[] = await response.json();
				const mapped = this.mapDbSongsToRecord(dbSongs);
				this.songsPerDay = { ...this.songsPerDay, ...mapped };
				this.loadedMonths.add(cacheKey);
			}
		} catch (err) {
			console.error('Failed to load songs:', err);
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
		
		try {
			const response = await fetch('/api/songs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dateKey, song })
			});

			if (response.ok) {
				this.songsPerDay[dateKey] = song;
			}
		} catch (err) {
			console.error('Failed to persist song:', err);
		} finally {
			this.closeSearch();
		}
	};

	removeSongFromDate = async (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		const dateKey = getDateKey(date);

		try {
			const response = await fetch(`/api/songs?dateKey=${dateKey}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				delete this.songsPerDay[dateKey];
			}
		} catch (err) {
			console.error('Failed to delete song:', err);
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
