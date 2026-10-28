/**
 * Central SEO metadata for Cadence.
 *
 * Everything the crawler and social scrapers need lives here so the layout,
 * the sitemap and the structured data never drift apart.
 */

export const SITE = {
	name: 'Cadence',
	/** Canonical production origin. No trailing slash. */
	url: 'https://cadence.franciscapt.dev',
	title: 'Cadence',
	tagline: 'Track your life, one song at a time',
	description:
		'Cadence turns your Spotify listening into a personal music journal. Save a song of the day and build a calendar of your life in music.',
	keywords: [
		'music journal',
		'song of the day',
		'Spotify calendar',
		'listening history',
		'daily song',
		'playlist import',
		'playlist export'
	],
	/** Locale used for Open Graph. */
	locale: 'en_US',
	ogImage: '/og.png',
	ogImageAlt: 'Cadence — a song each day. A daily music journal for Spotify.',
	ogImageWidth: 1200,
	ogImageHeight: 630,
	author: 'franciscapt',
	github: 'https://github.com/franpts2/cadence'
} as const;

/** Absolute URL for a path that may be relative. */
export function absoluteUrl(path = '/'): string {
	return new URL(path, SITE.url).toString();
}

/** Canonical URL for the current pathname (query and hash stripped). */
export function canonicalUrl(pathname: string): string {
	return absoluteUrl(pathname);
}

/**
 * Schema.org WebApplication description of Cadence.
 * Kept as a plain object so it can be serialised into a JSON-LD script tag.
 */
export function structuredData() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE.name,
		alternateName: 'Cadence — Spotify music journal',
		url: absoluteUrl('/'),
		description: SITE.description,
		applicationCategory: 'LifestyleApplication',
		operatingSystem: 'Web',
		browserRequirements: 'Requires JavaScript and a Spotify account',
		isAccessibleForFree: true,
		inLanguage: 'en',
		author: {
			'@type': 'Person',
			name: SITE.author,
			url: SITE.github
		},
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		featureList: [
			'Daily song of the day',
			'Visual listening calendar',
			'Spotify playlist import',
			'Spotify playlist export',
			'Shareable month calendar image',
			'Drag and drop songs between days'
		]
	};
}
