"use client";

import { API } from "@/constants";
import { trpc } from "@/trpc/client";

export function VideosSection() {
  const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: API.DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return <div>{JSON.stringify(data)}</div>;
}
