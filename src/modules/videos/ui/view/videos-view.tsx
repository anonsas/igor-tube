"use client";

interface Props {
  videoId: string;
}

export function VideosView({ videoId }: Props) {
  return <div>videos-view {videoId}</div>;
}
