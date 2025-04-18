import { z } from "zod";
import Link from "next/link";
import { CopyCheckIcon, CopyIcon } from "lucide-react";

import { snakeCaseToTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { videoSelectSchema } from "@/db/schema";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";

interface Props {
  fullUrl: string;
  video: z.infer<typeof videoSelectSchema>;
}

export function VideoPreview({ fullUrl, video }: Props) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
      <div className="relative aspect-video overflow-hidden">
        <VideoPlayer playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />
      </div>

      <div className="flex flex-col p-4 gap-y-6">
        <div className="flex justify-between items-center gap-x-2">
          <div className="flex flex-col gap-y-1">
            <p className="text-muted-foreground text-sm">Video link</p>
            <div className="flex items-center gap-x-2">
              <Link href={`/videos/${video.id}`}>
                <p className="line-clamp-1 text-sm text-blue-500">{fullUrl}</p>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => copy(fullUrl)}
                disabled={isCopied}
              >
                {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col gapy-1">
            <p className="text-muted-foreground text-xs">Video status</p>
            <p className="text-sm">{snakeCaseToTitle(video.muxStatus || "preparing")}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gapy-1">
            <p className="text-muted-foreground text-xs">Subtitles status</p>
            <p className="text-sm">{snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
