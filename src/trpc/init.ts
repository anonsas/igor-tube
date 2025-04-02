import { cache } from "react";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rateLimit";

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  // Ensure user is authenticated
  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
  }

  // Fetch user from DB
  const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId)).limit(1);
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in database" });
  }

  // Rate limiting check
  const { success } = await rateLimit.limit(user.id);
  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" });
  }

  // Proceed with the next procedure
  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
