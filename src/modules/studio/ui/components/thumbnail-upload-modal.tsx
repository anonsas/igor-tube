import { trpc } from "@/trpc/client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "@/components/responsive-modal";

interface Props {
  videoId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ThumbnailUploadModal({ videoId, isOpen, setIsOpen }: Props) {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });
    setIsOpen(false);
  };

  return (
    <ResponsiveModal title="Upload a thumbnail" open={isOpen} onOpenChange={setIsOpen}>
      <UploadDropzone endpoint="thumbnailUploader" input={{ videoId }} onClientUploadComplete={onUploadComplete} />
    </ResponsiveModal>
  );
}
