import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

import { users } from "./users";
import { categories } from "./categories";
import { videoVisibility } from "./enums";

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  muxStatus: text("mux_status"), // Current status of the Mux upload (waiting, preparing, etc.).
  muxAssetId: text("mux_asset_id").unique(), // Mux's unique asset identifier (after video is processed).
  muxUploadId: text("mux_upload_id").unique(), // Mux's unique identifier for the upload (before processing).
  muxPlaybackId: text("mux_playback_id").unique(), // Mux’s ID used for streaming (used in the video player).
  muxTrackId: text("mux_track_id").unique(), // Optional track ID (for subtitles, etc.).
  muxTrackStatus: text("mux_track_status"), // Status of the subtitle track (like ready, errored).
  thumbnailUrl: text("thumbnail_url"), // Public URL of the video thumbnail (from UploadThing).
  thumbnailKey: text("thumbnail_key"), // Internal UploadThing key for the thumbnail (used to delete/update).
  previewUrl: text("preview_url"), // Preview video URL (like a short preview clip or teaser).
  previewKey: text("preview_key"), // Internal UploadThing key for the preview file (animated gif).
  duration: integer("duration").default(0).notNull(), // Duration of the video in seconds. Default is 0.
  visibility: videoVisibility().default("private").notNull(), // ['public', 'private'])
  userId: uuid("user_id") // Foreign key to the users table. The video's owner. Required.
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    // Optional foreign key to categories. On delete, it sets to null.
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);
