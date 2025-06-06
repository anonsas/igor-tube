// http://localhost:3000/api/videos/workflows/title

import { eq, and } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db, videos } from "@/db/schema";

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve<InputType>(async (context) => {
  const { userId, videoId } = context.requestPayload;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

    if (!existingVideo) throw new Error("Not found");
    return existingVideo;
  });

  // A text version of the spoken content in a video or audio recording.
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);

    const text = response.text();
    if (!text) throw new Error("Bad request");
    return text;
  });

  const { body } = await context.api.openai.call("generate-title", {
    token: process.env.OPENAI_API_KEY!,
    operation: "chat.completions.create",
    body: {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: TITLE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    },
  });

  const title = body.choices[0]?.message.content;
  if (!title) throw new Error("Bad request");

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ title: title || video.title })
      .where(and(eq(videos.userId, video.userId), eq(videos.id, video.id)));
  });
});
