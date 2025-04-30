import { mux } from "@/lib/mux";
import { db, videos } from "@/db/schema";

export async function createVideo(userId: string) {
  const directUpload = await mux.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      passthrough: userId,
      playback_policy: ["public"],
      input: [
        {
          generated_subtitles: [{ language_code: "en", name: "English" }],
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
}
