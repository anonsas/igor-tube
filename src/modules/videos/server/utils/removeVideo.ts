import { and, eq } from "drizzle-orm";
import { mux } from "@/lib/mux";
import { db, videos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export async function removeVideo(userId: string, videoId: string) {
  // 1. Find the video, but don’t delete it yet (db data removed in Mux webhook)
  const [existingVideo] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

  if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

  // 2. Delete asset from Mux
  if (existingVideo.muxAssetId) {
    await mux.video.assets.delete(existingVideo.muxAssetId);
  }

  return existingVideo;
}
