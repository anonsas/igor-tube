import z from "zod";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc } from "drizzle-orm";

export const studioRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      console.log("input", input);

      const { id: userId } = ctx.user;

      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1);

      const hasMore = data.length > limit;

      // Remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

      return { items, nextCursor };
    }),
});

//The outer and() ensures that both conditions must be true:
// The video belongs to the given userId. AND
// If a cursor exists, apply pagination conditions.

// If cursor exists, we filter results based on the updatedAt and id fields:
// lt(videos.updatedAt, cursor.updatedAt):
// Fetch videos created before the cursor’s updatedAt.
// If the updatedAt is the same as the cursor’s, we break ties using id:
// and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
// This ensures stable pagination by preventing duplicates.
// If cursor does not exist, this part is ignored (undefined).

// Example
// Given data:
// id	    updatedAt	              userId
// 101	  2024-04-02 10:00:00	    user123
// 102	  2024-04-02 09:59:00	    user123
// 103	  2024-04-02 09:59:00	    user123
// 104	  2024-04-02 09:58:00	    user123
// If cursor = { updatedAt: "2024-04-02 09:59:00", id: 103 }, then:
// Exclude 103 and anything newer.

// Get videos where:
// updatedAt < "2024-04-02 09:59:00" (video 104).
// Or updatedAt = "2024-04-02 09:59:00" but id < 103 (video 102).

// Result: [102, 104]
