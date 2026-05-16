export interface Song {
	id: string;
	name: string;
	artists: { name: string }[];
	album: {
		name: string;
		images: { url: string }[];
	};
	duration_ms: number;
}

export interface DbSong {
	id: string;
	userId: string;
	dateKey: string;
	songId: string;
	songName: string;
	artistName: string;
	albumName: string;
	albumImageUrl: string | null;
	previewUrl: string | null;
	createdAt: Date | null;
}
