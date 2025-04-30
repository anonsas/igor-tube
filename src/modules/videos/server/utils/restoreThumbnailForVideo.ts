import { UTApi } from "uploadthing/server";
import { db, videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export async function restoreThumbnailForVideo(video: typeof videos.$inferSelect) {
  const utApi = new UTApi();

  // 1. Remove existing thumbnail if exists
  if (video.thumbnailKey) {
    await utApi.deleteFiles(video.thumbnailKey);
    await db
      .update(videos)
      .set({ thumbnailKey: null, thumbnailUrl: null })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  }

  // 2. Generate thumbnail from Mux
  if (!video.muxPlaybackId) throw new TRPCError({ code: "BAD_REQUEST" });

  const thumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png`;
  const uploaded = await utApi.uploadFilesFromUrl(thumbnailUrl);

  if (!uploaded.data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  const { key, ufsUrl } = uploaded.data;

  const [updatedVideo] = await db
    .update(videos)
    .set({ thumbnailKey: key, thumbnailUrl: ufsUrl })
    .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)))
    .returning();

  return updatedVideo;
}
