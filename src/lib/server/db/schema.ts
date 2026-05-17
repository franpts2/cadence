import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { AdapterAccount } from "@auth/core/adapters";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

/**
 * Normalized Song Metadata
 */
export const songs = sqliteTable("song", {
  id: text("id").notNull().primaryKey(), // The Spotify ID
  name: text("name").notNull(),
  artistName: text("artist_name").notNull(),
  albumName: text("album_name").notNull(),
  albumImageUrl: text("album_image_url"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});

/**
 * User Daily Entries
 */
export const dailySongs = sqliteTable("daily_song", {
  id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dateKey: text("date_key").notNull(), // "YYYY-MM-DD"
  songId: text("song_id")
    .notNull()
    .references(() => songs.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`(strftime('%s', 'now') * 1000)`),
}, (table) => ({
  userDateIdx: uniqueIndex("user_date_idx").on(table.userId, table.dateKey),
}));
