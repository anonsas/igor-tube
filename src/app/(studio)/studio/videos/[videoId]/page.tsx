import { VideosView } from "@/modules/videos/ui/view/videos-view";
import React from "react";

interface Props {
  params: { videoId: string };
}
export default async function Page({ params }: Props) {
  return (
    <div>
      <VideosView videoId={params.videoId} />
    </div>
  );
}
