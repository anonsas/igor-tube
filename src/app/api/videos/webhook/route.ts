import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { UTApi } from "uploadthing/server";

import { db } from "@/db/schema";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

const SIGNING_TOKEN = process.env.MUX_WEBHOOK_TOKEN;

export async function POST(request: Request) {
  if (!SIGNING_TOKEN) throw new Error("MUX_WEBHOOK_TOKEN is not set");

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");
  if (!muxSignature) return new Response("no signature found", { status: 401 });

  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_TOKEN
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

      const playbackId = data.playback_ids?.[0].id;
      if (!playbackId) return new Response("Missing playback ID", { status: 400 });

      const temporaryThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;
      const temporaryPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const utApi = new UTApi();

      // 🧹 Get old keys from the DB
      const [existingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey })
        .from(videos)
        .where(eq(videos.muxUploadId, data.upload_id));

      // 🧼 Delete old files if keys exist
      if (existingVideo.thumbnailKey) {
        await utApi.deleteFiles(existingVideo.thumbnailKey);
      }
      // 📤 Upload new files
      const [uploadedThumbnail, uploadedPreview] = await utApi.uploadFilesFromUrl([
        temporaryThumbnailUrl,
        temporaryPreviewUrl,
      ]);

      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        return new Response("Failed to upload thubmnail or preview", { status: 500 });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;
      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

      // 💾 Update DB with new values
      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxPlaybackId: playbackId,
          muxStatus: data.status,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

      const utApi = new UTApi();

      const [existingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey, previewKey: videos.previewKey })
        .from(videos)
        .where(eq(videos.muxUploadId, data.upload_id));

      if (!existingVideo) return new Response("No video found", { status: 404 });

      if (existingVideo.previewKey) await utApi.deleteFiles(existingVideo.previewKey);
      if (existingVideo.thumbnailKey) await utApi.deleteFiles(existingVideo.thumbnailKey);
      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & { asset_id: string };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;

      if (!assetId) return new Response("Missing asset ID", { status: 400 });

      await db
        .update(videos)
        .set({
          muxAssetId: assetId,
          muxTrackId: trackId,
          muxTrackStatus: status,
        })
        .where(eq(videos.muxAssetId, assetId));
      break;
    }
  }

  return new Response("Webhook received", { status: 200 });
}
