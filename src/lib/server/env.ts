import { z } from 'zod';
import * as env from '$env/static/private';

const envSchema = z.object({
	SPOTIFY_CLIENT_ID: z.string().min(1, "Missing SPOTIFY_CLIENT_ID"),
	SPOTIFY_CLIENT_SECRET: z.string().min(1, "Missing SPOTIFY_CLIENT_SECRET"),
	AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
	TURSO_DATABASE_URL: z.string().url("TURSO_DATABASE_URL must be a valid URL"),
	TURSO_AUTH_TOKEN: z.string().min(1, "Missing TURSO_AUTH_TOKEN"),
});

const result = envSchema.safeParse(env);

if (!result.success) {
	console.error('❌ Invalid environment variables:', result.error.format());
	throw new Error('Invalid environment variables. Check your .env file.');
}

export const validatedEnv = result.data;
