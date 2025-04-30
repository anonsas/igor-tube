import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { videoUpdateSchema } from "@/db/schema";

export function useVideoForm(videoId: string) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const mutations = {
    updateVideo: trpc.videos.update.useMutation({
      onSuccess: () => {
        utils.studio.getMany.invalidate();
        utils.studio.getOne.invalidate({ id: videoId });
        toast.success("Video updated");
      },
      onError: () => toast.error("Something went wrong"),
    }),

    deleteVideo: trpc.videos.remove.useMutation({
      onSuccess: () => {
        utils.studio.getMany.invalidate();
        toast.success("Video removed");
        router.push("/studio");
      },
      onError: () => toast.error("Something went wrong"),
    }),

    restoreThumbnail: trpc.videos.restoreThumbnail.useMutation({
      onSuccess: () => {
        utils.studio.getMany.invalidate();
        utils.studio.getOne.invalidate({ id: videoId });
        toast.success("Thumbnail restored");
      },
      onError: () => toast.error("Something went wrong"),
    }),

    generateTitle: trpc.videos.generateTitle.useMutation({
      onSuccess: () => {
        toast.success("Background job started", { description: "This may take some time" });
      },
      onError: () => toast.error("Something went wrong"),
    }),

    generateDescription: trpc.videos.generateDescription.useMutation({
      onSuccess: () => {
        toast.success("Background job started", { description: "This may take some time" });
      },
      onError: () => toast.error("Something went wrong"),
    }),

    generateThumbnail: trpc.videos.generateThumbnail.useMutation({
      onSuccess: () => {
        toast.success("Background job started", { description: "This may take some time" });
      },
      onError: () => toast.error("Something went wrong"),
    }),
  };

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  return { form, video, categories, mutations };
}
