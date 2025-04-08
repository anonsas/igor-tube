"use client";

import Link from "next/link";
import { Suspense } from "react";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { API } from "@/constants";
import { trpc } from "@/trpc/client";
import { snakeCaseToTitle } from "@/lib/utils";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function VideosSection() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function VideosSectionSuspense() {
  const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    { limit: API.DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const videos = data.pages.flatMap((page) => page.items);

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {videos.map((video) => (
              <Link key={video.id} href={`/studio/videos/${video.id}`} legacyBehavior>
                <TableRow className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-4 ">
                      <div className="relative aspect-video w-36 shrink-0">
                        <VideoThumbnail
                          title={video.title}
                          duration={video.duration}
                          imageUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                        />
                      </div>

                      <div className="flex flex-col overflow-hidden gap-y-1">
                        <span className="text-sm line-clamp-1">{video.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {video.description ?? "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      {video.visibility === "private" ? (
                        <LockIcon className="size-4 mr-2" />
                      ) : (
                        <Globe2Icon className="size-4 mr-2" />
                      )}
                      {snakeCaseToTitle(video.visibility)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">{snakeCaseToTitle(video.muxStatus ?? "error")}</div>
                  </TableCell>
                  <TableCell className="text-sm truncate">{format(new Date(video.createdAt), "d MMM yyyy")}</TableCell>
                  <TableCell className="text-right">Views</TableCell>
                  <TableCell className="text-right">Comments</TableCell>
                  <TableCell className="text-right pr-6">Likes</TableCell>
                </TableRow>
              </Link>
            ))}
          </TableBody>
        </Table>
      </div>

      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
}
