import { z } from 'zod';

export const SongSchema = z.object({
	id: z.string(),
	name: z.string(),
	artists: z.array(z.object({ name: z.string() })),
	album: z.object({
		name: z.string(),
		images: z.array(z.object({ url: z.string() }))
	}),
	duration_ms: z.number().optional().default(0)
});

export type Song = z.infer<typeof SongSchema>;

export interface DbSong {
	id: string;
	userId: string;
	dateKey: string;
	songId: string;
	songName: string;
	artistName: string;
	albumName: string;
	albumImageUrl: string | null;
	createdAt: Date | null;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}
