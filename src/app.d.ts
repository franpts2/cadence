import { DefaultSession } from "@auth/sveltekit";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module "@auth/sveltekit" {
	interface Session {
		accessToken?: string;
		error?: string;
		user: {
			id?: string;
		} & DefaultSession["user"];
	}
}

declare module "@auth/core/jwt" {
	interface JWT {
		accessToken?: string;
		accessTokenExpires?: number;
		refreshToken?: string;
		user?: any;
		error?: string;
	}
}

export {};
