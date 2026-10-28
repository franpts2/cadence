import type { PageServerLoad } from './$types';

/**
 * Auth.js sends every failed sign-in here as `/auth-error?error=<code>`.
 *
 * The code shown on the page is deliberately surfaced (it is not sensitive) so
 * people can paste it into a support message, and it is logged here so a live
 * `wrangler pages deployment tail` shows exactly which failures real users hit.
 */
export const load: PageServerLoad = async ({ url, request }) => {
	const error = url.searchParams.get('error') ?? 'Unknown';

	console.error('[auth] sign-in failed', {
		error,
		code: url.searchParams.get('code') ?? undefined,
		referer: request.headers.get('referer') ?? undefined,
		userAgent: request.headers.get('user-agent') ?? undefined
	});

	return { error };
};
