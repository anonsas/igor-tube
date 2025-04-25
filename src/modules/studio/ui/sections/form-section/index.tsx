"use client";

import { useState, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { FormSectionSkeleton } from "./skeleton";
import { UploadForm } from "../../components/upload-form";
import { ThumbnailUploadModal } from "../../components/thumbnail-upload-modal";

interface Props {
  videoId: string;
}

export function FormSection({ videoId }: Props) {
  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Suspense fallback={<FormSectionSkeleton />}>
        <FormSectionSuspense videoId={videoId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function FormSectionSuspense({ videoId }: Props) {
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);

  return (
    <>
      <ThumbnailUploadModal videoId={videoId} isOpen={isThumbnailModalOpen} setIsOpen={setIsThumbnailModalOpen} />

      <UploadForm videoId={videoId} setIsThumbnailModalOpen={setIsThumbnailModalOpen} />
    </>
  );
}
