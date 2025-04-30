import type { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, videos } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { videoUpdateSchema } from "@/db/schema";

type UpdateInput = z.infer<typeof videoUpdateSchema>;

export async function updateVideo(input: UpdateInput, userId: string) {
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
}
