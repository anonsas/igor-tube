"use client";

import { useParams } from "next/navigation";

export function VideosView() {
  const params = useParams();
  console.log("params", params);

  return <div>videos-view</div>;
}
