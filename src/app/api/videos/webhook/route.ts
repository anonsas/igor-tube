import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";

import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
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
    case "video.asset.created":
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

      await db
        .update(videos)
        .set({
          muxAssedId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
  }

  return new Response("Webhook received", { status: 200 });
}
