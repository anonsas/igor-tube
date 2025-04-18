import { API } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { StudioView } from "@/modules/studio/ui/views/studio-view";

export default async function Page() {
  void trpc.studio.getMany.prefetchInfinite({ limit: API.DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
}
