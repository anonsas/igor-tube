import Image from "next/image";

import { formatDuration } from "@/lib/utils";

interface Props {
  title: string;
  duration: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
}

export function VideoThumbnail({ title, duration, imageUrl, previewUrl }: Props) {
  return (
    <div className="relative group">
      {/* Thumbnail Wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-100"
        />
      </div>

      {/* Video duration box */}

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-xs text-white font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
}
