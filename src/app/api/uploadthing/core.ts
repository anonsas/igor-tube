import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { UploadThingError, UTApi } from "uploadthing/server";

import { auth } from "@clerk/nextjs/server";
import { db, users, videos } from "@/db/schema";
import { createUploadthing, type FileRouter } from "uploadthing/next";

// Initialize the UploadThing configuration instance
const f = createUploadthing();

// Define the file router for handling file uploads
export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB", // Limit to 4MB
      maxFileCount: 1, // Only allow one image per upload
    },
  })
    // Expect `videoId` as input and ensure it's a valid UUID
    .input(z.object({ videoId: z.string().uuid() }))

    // Middleware to run before the upload starts
    .middleware(async ({ input }) => {
      // Step 1: Authenticate the user
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      // Step 2: Fetch the user from the database using Clerk ID
      const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError("Unauthorized");

      // Step 3: Check if the video exists and belongs to the authenticated user
      const [existingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      if (!existingVideo) throw new UploadThingError("Not found");

      // Step 4: If the video already has a thumbnail, delete it and clear the DB values
      if (existingVideo.thumbnailKey) {
        const utApi = new UTApi();

        // Delete the previous thumbnail file from UploadThing
        await utApi.deleteFiles(existingVideo.thumbnailKey);

        // Clear the thumbnail info from the database
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }
      // Step 5: Pass metadata to the next handler (used in `onUploadComplete`)
      return { userId: user.id, videoId: input.videoId };
    })
    // This runs after a successful upload
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId, videoId } = metadata;

      // Step 6: Save the uploaded file's URL and key to the video in the DB
      await db
        .update(videos)
        .set({ thumbnailUrl: file.ufsUrl, thumbnailKey: file.key })
        .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

      // Optional: return something to the client or system
      return { uploadedBy: userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
