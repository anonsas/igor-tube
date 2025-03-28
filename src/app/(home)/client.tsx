"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "Igor" });

  return <div>Page Client component: {data.greeting}</div>;
};
