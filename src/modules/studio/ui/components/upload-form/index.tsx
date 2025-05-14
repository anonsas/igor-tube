import { z } from "zod";
import type { Dispatch, SetStateAction } from "react";

import { FormHeader } from "./form-header";
import { Form } from "@/components/ui/form";
import { videoUpdateSchema } from "@/db/schema";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { useFullUrl } from "@/hooks/use-full-url";
import { useVideoForm } from "../../hooks/useVideoForm";
import { FormVideoPreview } from "./form-video-preview";
import { FormFieldCategory } from "./form-field-category";
import { FormFieldThumbnail } from "./form-field-thumbnail";
import { FormFieldVisibility } from "./form-field-visibility";
import { FormFieldTitleAndDescription } from "./form-field-title-and-description";

interface Props {
  videoId: string;
  setIsThumbnailModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsThumbnailGenerateModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function UploadForm({ videoId, setIsThumbnailModalOpen, setIsThumbnailGenerateModalOpen }: Props) {
  const fullUrl = useFullUrl(`/videos/${videoId}`);
  const { form, video, categories, mutations } = useVideoForm(videoId);

  const onDeleteVideo = () => mutations.deleteVideo.mutate({ id: videoId });
  const onRestoreThumbnail = () => mutations.restoreThumbnail.mutate({ id: videoId });
  const onGenerateTitle = () => mutations.generateTitle.mutate({ id: videoId });
  const onGenerateDescription = () => mutations.generateDescription.mutate({ id: videoId });

  // If we use: updateVideo.mutate(data) - this form.formState.isSubmitting won't work
  const onSubmitForm = async (data: z.infer<typeof videoUpdateSchema>) => await mutations.updateVideo.mutateAsync(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <FormHeader
          onDeleteVideo={onDeleteVideo}
          isButtonDisabled={mutations.updateVideo.isPending || !form.formState.isDirty}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-8 lg:col-span-3">
            <FormFieldTitleAndDescription
              form={form}
              isButtonDisabled={!video.muxTrackId}
              onGenerateTitle={onGenerateTitle}
              onGenerateDescription={onGenerateDescription}
              isTitlePending={mutations.generateTitle.isPending}
              isDescriptionPending={mutations.generateDescription.isPending}
            />
            <FormFieldThumbnail
              form={form}
              thumbnailUrl={video.thumbnailUrl || THUMBNAIL_FALLBACK}
              onRestoreThumbnail={onRestoreThumbnail}
              setIsThumbnailModalOpen={setIsThumbnailModalOpen}
              setIsThumbnailGenerateModalOpen={setIsThumbnailGenerateModalOpen}
            />
            <FormFieldCategory form={form} categories={categories} />
          </div>

          <div className="flex flex-col gap-y-8 lg:col-span-2">
            <FormVideoPreview videoUrl={fullUrl} video={video} />
            <FormFieldVisibility form={form} />
          </div>
        </div>
      </form>
    </Form>
  );
}
