import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db, videos } from "@/db/schema";

export async function getVideo(userId: string, videoId: string) {
  const [video] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

  if (!video) throw new TRPCError({ code: "NOT_FOUND" });

  return video;
}
