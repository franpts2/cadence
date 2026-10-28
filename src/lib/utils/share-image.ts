import type { Song } from '../types';
import { SITE } from '../seo';
import {
	DAYS_OF_WEEK,
	MONTHS,
	getDateKey,
	getDaysInMonth,
	getStartDayOfMonth
} from './date';

/**
 * The shared "photo of your month".
 *
 * Rendered on a canvas instead of screenshotting the DOM: the result is a fixed
 * 1080×1350 (4:5) image that does not inherit whatever viewport the user
 * happens to be on, and the layout can be tuned without the app chrome leaking
 * in.
 */

export const SHARE_IMAGE_WIDTH = 1080;
export const SHARE_IMAGE_HEIGHT = 1350;

const PAD = 84;
const COVER_GAP = 10;
const COVER_RADIUS = 10;
const RULE_Y = PAD + 218;
const WEEKDAY_BASELINE_OFFSET = 54;
const WEEKDAY_TO_GRID = 38;
const BLOCK_TOP_MIN = RULE_Y + 28;
const FOOTER_BASELINE = SHARE_IMAGE_HEIGHT - PAD + 8;
const GRID_BOTTOM_LIMIT = SHARE_IMAGE_HEIGHT - PAD - 56;

const FONT_STACK =
	"'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** `cadence.franciscapt.dev`, without the scheme. */
const SITE_HOST = SITE.url.replace(/^https?:\/\//, '');

export interface ShareDay {
	day: number;
	song: Song | null;
}

export interface ShareLayout {
	startDay: number;
	daysInMonth: number;
	rows: number;
	gridX: number;
	gridY: number;
	gridWidth: number;
	gridHeight: number;
	cell: number;
	gap: number;
	ruleY: number;
	weekdayBaseline: number;
	footerBaseline: number;
}

/** Only the days of the given month, keyed so stale months can never leak in. */
export function getShareDays(
	year: number,
	month: number,
	songs: Record<string, Song>
): ShareDay[] {
	const daysInMonth = getDaysInMonth(year, month);
	return Array.from({ length: daysInMonth }, (_, i) => {
		const day = i + 1;
		return {
			day,
			song: songs[getDateKey(new Date(year, month, day))] ?? null
		};
	});
}

export function computeShareLayout(year: number, month: number): ShareLayout {
	const startDay = getStartDayOfMonth(year, month);
	const daysInMonth = getDaysInMonth(year, month);
	const rows = Math.ceil((startDay + daysInMonth) / 7);
	const gridWidth = SHARE_IMAGE_WIDTH - PAD * 2;
	const cell = (gridWidth - COVER_GAP * 6) / 7;
	const gridHeight = rows * cell + (rows - 1) * COVER_GAP;

	// Centre the weekday row and grid together, so the labels always sit just
	// above the first row instead of being stranded by a short month.
	const blockHeight = WEEKDAY_BASELINE_OFFSET + WEEKDAY_TO_GRID + gridHeight;
	const available = GRID_BOTTOM_LIMIT - BLOCK_TOP_MIN;
	const blockTop = BLOCK_TOP_MIN + Math.max(0, (available - blockHeight) / 2);
	const weekdayBaseline = blockTop + WEEKDAY_BASELINE_OFFSET;
	const gridY = blockTop + WEEKDAY_BASELINE_OFFSET + WEEKDAY_TO_GRID;

	return {
		startDay,
		daysInMonth,
		rows,
		gridX: PAD,
		gridY,
		gridWidth,
		gridHeight,
		cell,
		gap: COVER_GAP,
		ruleY: RULE_Y,
		weekdayBaseline,
		footerBaseline: FOOTER_BASELINE
	};
}

export function getShareFilename(year: number, month: number): string {
	const name = MONTHS[month].toLowerCase();
	return `cadence-${name}-${year}.png`;
}

export interface RenderShareImageOptions {
	year: number;
	month: number;
	songs: Record<string, Song>;
	/** Called when an individual cover could not be loaded. */
	onCoverError?: (url: string) => void;
}

export async function renderShareImage({
	year,
	month,
	songs,
	onCoverError
}: RenderShareImageOptions): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = SHARE_IMAGE_WIDTH;
	canvas.height = SHARE_IMAGE_HEIGHT;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas 2D is not available');

	const days = getShareDays(year, month, songs);
	const covers = await loadCovers(days, onCoverError);

	draw(ctx, { year, month, days, covers });

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image'))),
			'image/png'
		);
	});
}

interface DrawOptions {
	year: number;
	month: number;
	days: ShareDay[];
	covers: Map<string, LoadedImage>;
}

function draw(ctx: CanvasRenderingContext2D, { year, month, days, covers }: DrawOptions) {
	const layout = computeShareLayout(year, month);

	// Background — matches the app's zinc-950.
	ctx.fillStyle = '#09090b';
	ctx.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

	// Wordmark
	ctx.fillStyle = '#71717a';
	ctx.font = `600 22px ${FONT_STACK}`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';
	drawTrackedText(ctx, 'CADENCE', PAD, PAD + 20, 9);

	// Month, then the year in a quieter weight
	ctx.font = `300 96px ${FONT_STACK}`;
	ctx.fillStyle = '#fafafa';
	ctx.fillText(MONTHS[month], PAD, PAD + 164);
	const monthWidth = ctx.measureText(MONTHS[month]).width;

	ctx.font = `300 40px ${FONT_STACK}`;
	ctx.fillStyle = '#52525b';
	ctx.fillText(String(year), PAD + monthWidth + 22, PAD + 164);

	// Hairline rule under the header
	ctx.fillStyle = '#27272a';
	ctx.fillRect(PAD, layout.ruleY, SHARE_IMAGE_WIDTH - PAD * 2, 1);

	// Weekday labels
	ctx.font = `600 18px ${FONT_STACK}`;
	ctx.fillStyle = '#71717a';
	ctx.textAlign = 'center';
	for (let col = 0; col < 7; col++) {
		const x = layout.gridX + col * (layout.cell + layout.gap) + layout.cell / 2;
		drawTrackedText(ctx, DAYS_OF_WEEK[col], x, layout.weekdayBaseline, 3, 'center');
	}

	// Days
	for (const { day, song } of days) {
		const index = layout.startDay + day - 1;
		const col = index % 7;
		const row = Math.floor(index / 7);
		const x = layout.gridX + col * (layout.cell + layout.gap);
		const y = layout.gridY + row * (layout.cell + layout.gap);

		const coverUrl = song?.album.images[0]?.url;
		const cover = coverUrl ? covers.get(coverUrl) : undefined;

		roundedRectPath(ctx, x, y, layout.cell, layout.cell, COVER_RADIUS);
		ctx.fillStyle = '#18181b';
		ctx.fill();

		if (cover) {
			ctx.save();
			roundedRectPath(ctx, x, y, layout.cell, layout.cell, COVER_RADIUS);
			ctx.clip();
			drawCover(ctx, cover, x, y, layout.cell);
			ctx.restore();
		}

		drawDayNumber(ctx, day, x, y, !!cover);
	}

	// Attribution: stays legible when the image is reposted.
	ctx.font = `500 20px ${FONT_STACK}`;
	ctx.fillStyle = '#52525b';
	ctx.textAlign = 'right';
	ctx.fillText(SITE_HOST, SHARE_IMAGE_WIDTH - PAD, layout.footerBaseline);
	ctx.textAlign = 'left';
}

function drawDayNumber(
	ctx: CanvasRenderingContext2D,
	day: number,
	x: number,
	y: number,
	onCover: boolean
) {
	ctx.font = `600 20px ${FONT_STACK}`;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'alphabetic';

	if (!onCover) {
		ctx.fillStyle = '#52525b';
		ctx.fillText(String(day), x + 12, y + 28);
		return;
	}

	// A translucent pill keeps the date readable over any album cover.
	const label = String(day);
	const textWidth = ctx.measureText(label).width;
	const height = 28;
	const width = Math.max(height, textWidth + 18);
	const pillX = x + 9;
	const pillY = y + 9;

	roundedRectPath(ctx, pillX, pillY, width, height, height / 2);
	ctx.fillStyle = 'rgba(9, 9, 11, 0.72)';
	ctx.fill();

	ctx.fillStyle = '#fafafa';
	ctx.textAlign = 'center';
	ctx.fillText(label, pillX + width / 2, pillY + 19);
	ctx.textAlign = 'left';
}

function drawCover(
	ctx: CanvasRenderingContext2D,
	cover: LoadedImage,
	x: number,
	y: number,
	size: number
) {
	const scale = Math.max(size / cover.width, size / cover.height);
	const width = cover.width * scale;
	const height = cover.height * scale;

	ctx.drawImage(
		cover.source,
		x + (size - width) / 2,
		y + (size - height) / 2,
		width,
		height
	);
}

/**
 * Canvas has no letter-spacing, so draw the wordmark glyph by glyph. Reserved
 * for short, mixed-case labels like CADENCE and SUN/MON/….
 */
function drawTrackedText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	tracking: number,
	align: 'left' | 'center' = 'left'
) {
	const width =
		[...text].reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
		tracking * Math.max(0, text.length - 1);
	let cursor = align === 'center' ? x - width / 2 : x;

	// Each glyph is placed manually, so the context must not centre or right
	// align the individual characters on top of that.
	ctx.textAlign = 'left';

	for (const char of text) {
		ctx.fillText(char, cursor, y);
		cursor += ctx.measureText(char).width + tracking;
	}
}

function roundedRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	const r = Math.min(radius, width / 2, height / 2);
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + width, y, x + width, y + height, r);
	ctx.arcTo(x + width, y + height, x, y + height, r);
	ctx.arcTo(x, y + height, x, y, r);
	ctx.arcTo(x, y, x + width, y, r);
	ctx.closePath();
}

interface LoadedImage {
	source: CanvasImageSource;
	width: number;
	height: number;
}

const COVER_TIMEOUT_MS = 8000;

async function loadCovers(
	days: ShareDay[],
	onCoverError?: (url: string) => void
): Promise<Map<string, LoadedImage>> {
	const urls = [
		...new Set(
			days
				.map(({ song }) => song?.album.images[0]?.url)
				.filter((url): url is string => !!url)
		)
	];

	const entries = await Promise.all(
		urls.map(async (url) => {
			const image = await loadCover(url);
			if (!image) onCoverError?.(url);
			return [url, image] as const;
		})
	);

	return new Map(entries.filter((entry): entry is [string, LoadedImage] => !!entry[1]));
}

/**
 * Fetch the cover as a blob before decoding. Spotify's CDN does send CORS
 * headers, but going through a blob keeps the canvas untainted even if a
 * redirect ever drops them.
 */
async function loadCover(url: string): Promise<LoadedImage | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), COVER_TIMEOUT_MS);

	try {
		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) return null;

		const blob = await response.blob();

		if (typeof createImageBitmap === 'function') {
			const bitmap = await createImageBitmap(blob);
			return { source: bitmap, width: bitmap.width, height: bitmap.height };
		}

		const objectUrl = URL.createObjectURL(blob);
		try {
			const image = new Image();
			image.src = objectUrl;
			await image.decode();
			return { source: image, width: image.naturalWidth, height: image.naturalHeight };
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}
