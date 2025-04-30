import { eq, and } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db, videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";

interface ThumbnailGenerationPayload {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve<ThumbnailGenerationPayload>(async (context) => {
  const { userId, videoId, prompt } = context.requestPayload;
  const utApi = new UTApi();

  // 1. Fetch video record
  const video = await context.run("fetch-video", async () => {
    const [foundVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

    if (!foundVideo) {
      throw new Error(`Video not found for userId: ${userId}, videoId: ${videoId}`);
    }

    return foundVideo;
  });

  // 2. Generate thumbnail using OpenAI
  const { body: generationResponse } = await context.call<{ data: { url: string }[] }>("generate-thumbnail", {
    url: "https://api.openai.com/v1/images/generations",
    method: "POST",
    body: {
      prompt,
      n: 1,
      model: "dall-e-3",
      size: "1792x1024",
    },
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const temporaryImageUrl = generationResponse.data?.[0]?.url;
  if (!temporaryImageUrl) {
    throw new Error("Failed to generate image from prompt");
  }

  // 3. Delete existing thumbnail if it exists
  await context.run("delete-old-thumbnail", async () => {
    if (!video.thumbnailKey) return;

    await utApi.deleteFiles(video.thumbnailKey);
    await db
      .update(videos)
      .set({
        thumbnailKey: null,
        thumbnailUrl: null,
      })
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));
  });

  // 4. Upload the newly generated thumbnail
  const uploadedThumbnail = await context.run("upload--new-thumbnail", async () => {
    const uploadResponse = await utApi.uploadFilesFromUrl(temporaryImageUrl);
    if (!uploadResponse?.data) {
      throw new Error("Failed to upload generated thumbnail");
    }

    return uploadResponse.data;
  });

  // 5. Update video record with new thumbnail
  await context.run("update-thumbnail-metadata", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploadedThumbnail.key,
        thumbnailUrl: uploadedThumbnail.ufsUrl,
      })
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));
  });
});
