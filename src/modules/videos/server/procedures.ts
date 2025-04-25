import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

import { mux } from "@/lib/mux";
import { db, videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videosRouter = createTRPCRouter({
  update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    if (!input.id) throw new TRPCError({ code: "BAD_REQUEST" });

    const [updatedVideo] = await db
      .update(videos)
      .set({
        userId,
        title: input.title || "",
        description: input.description,
        categoryId: input.categoryId,
        visibility: input.visibility ?? "private",
        updatedAt: new Date(),
      })
      .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
      .returning();

    if (!updatedVideo) throw new TRPCError({ code: "NOT_FOUND" });
    return updatedVideo;
  }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const directUpload = await mux.video.uploads.create({
      cors_origin: "*", // TODO: in production set to my URL
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: directUpload.id,
      })
      .returning();

    return { video, url: directUpload.url };
  }),
  remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    // 1. Find the video, but don’t delete it yet (db data removed in Mux webhook)
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

    if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

    // 2. Delete asset from Mux
    if (existingVideo.muxAssetId) {
      await mux.video.assets.delete(existingVideo.muxAssetId);
    }

    return existingVideo;
  }),

  // Removes the existing thumbnail.
  // Re-generates a thumbnail from Mux (using muxPlaybackId) and uploads it to UploadThing.
  // Saves the new thumbnailUrl and thumbnailKey.
  restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const videoId = input.id;

    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

    if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });
    if (existingVideo.thumbnailKey) {
      const utApi = new UTApi();
      await utApi.deleteFiles(existingVideo.thumbnailKey);
      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    }
    if (!existingVideo.muxPlaybackId) throw new TRPCError({ code: "BAD_REQUEST" });

    const temporaryThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.png`;

    const utApi = new UTApi();
    const uploadedThumbnail = await utApi.uploadFilesFromUrl(temporaryThumbnailUrl);
    if (!uploadedThumbnail.data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;

    const [updatedVideo] = await db
      .update(videos)
      .set({ thumbnailUrl, thumbnailKey })
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)))
      .returning();

    return updatedVideo;
  }),
});
