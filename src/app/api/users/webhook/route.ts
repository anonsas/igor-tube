import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const CLERK_SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!CLERK_SIGNING_SECRET) {
    throw new Error("Error: Please add CLERK_SIGNING_SECRET from Clerk Dashboard to .env or .env");
  }

  // Create new Svix instance with secret
  const wh = new Webhook(CLERK_SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let webhookEvent: WebhookEvent;

  // Verify payload with headers
  try {
    webhookEvent = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  if (webhookEvent.type === "user.created") {
    await db.insert(users).values({
      clerkId: webhookEvent.data.id,
      name: `${webhookEvent.data.first_name} ${webhookEvent.data.last_name}`,
      imageUrl: webhookEvent.data.image_url,
    });
  }

  if (webhookEvent.type === "user.deleted") {
    if (!webhookEvent.data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    await db.delete(users).where(eq(users.clerkId, webhookEvent.data.id));
  }

  if (webhookEvent.type === "user.updated") {
    if (!webhookEvent.data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    await db
      .update(users)
      .set({
        name: `${webhookEvent.data.first_name} ${webhookEvent.data.last_name}`,
        imageUrl: webhookEvent.data.image_url,
      })
      .where(eq(users.clerkId, webhookEvent.data.id));
    // await db.delete(users).where(eq(users.clerkId, webhookEvent.data.id));
  }

  return new Response("Webhook received", { status: 200 });
}
