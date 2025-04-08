import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const directUpload = await mux.video.uploads.create({
      cors_origin: "*", // TODO: in production set to my URL
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
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
});
