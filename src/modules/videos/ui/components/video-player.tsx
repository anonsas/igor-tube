"use client";

import MuxPlayer from "@mux/mux-player-react";

interface Props {
  playbackId: string | null | undefined;
  thumbnailUrl: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export function VideoPlayer({ playbackId, thumbnailUrl, autoPlay, onPlay }: Props) {
  return (
    <MuxPlayer
      playbackId={playbackId || ""}
      poster={thumbnailUrl || "./placeholder.svg"}
      playerInitTime={0}
      thumbnailTime={0}
      autoPlay={autoPlay}
      onPlay={onPlay}
      className="w-full h-full object-contain"
      accentColor="#ff2056"
    />
  );
}
