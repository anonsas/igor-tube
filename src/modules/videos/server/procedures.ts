import { z } from "zod";
import { videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  createVideo,
  updateVideo,
  removeVideo,
  getVideo,
  restoreThumbnailForVideo,
  triggerVideoWorkflow,
} from "./utils";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => createVideo(ctx.user.id)),
  update: protectedProcedure.input(videoUpdateSchema).mutation(({ ctx, input }) => updateVideo(input, ctx.user.id)),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => removeVideo(ctx.user.id, input.id)),

  restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const video = await getVideo(ctx.user.id, input.id);
    return restoreThumbnailForVideo(video);
  }),

  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => triggerVideoWorkflow("title", ctx.user.id, input.id)),

  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => triggerVideoWorkflow("description", ctx.user.id, input.id)),

  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => triggerVideoWorkflow("thumbnail", ctx.user.id, input.id)),
});
