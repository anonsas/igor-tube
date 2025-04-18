import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { mux } from "@/lib/mux";
import { db, videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

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

    const [removedVideo] = await db
      .delete(videos)
      .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
      .returning();

    if (!removedVideo) throw new TRPCError({ code: "NOT_FOUND" });
    return removedVideo;
  }),
});
