# HydrateClient for Prefetching Data in Next.js

## Overview

When working with **prefetched data** in Next.js, especially in **server-side components**, it's important to ensure that the client-side components can pick up the preloaded data and avoid unnecessary re-fetching. The `HydrateClient` component helps achieve this by properly hydrating the client with preloaded data.

## Why Use `<HydrateClient>`?

We use `<HydrateClient>` in our **`page.tsx`** (server-side component) to ensure that:

1. **Hydration**: The preloaded data (via `.prefetch()`) is correctly passed from the server to the client.
2. **Avoid Client-Side Fetching**: By hydrating the query client on the server, the client-side component can immediately use the prefetched data, skipping the initial client-side fetch. This improves performance and reduces unnecessary API calls.

## How to Use `<HydrateClient>`

Whenever you use `.prefetch()` in your server-side code, wrap your client component in `<HydrateClient>` to ensure proper data hydration.

### Example:

```tsx
// page.tsx (Server Component)
import { HydrateClient } from "@/trpc/server";
import { View } from "./client";

export default async function Page() {
  // Prefetch data on the server
  void trpc.someData.prefetch({ text: "hello" });

  return (
    <HydrateClient>
      <View />
    </HydrateClient>
  );
}
```

## Explanation:

HydrateClient: A Higher-order Component (HoC) that hydrates the query client for a client-side component. It ensures that the client-side component picks up the prefetched promise and avoids performing the initial client-side fetch.

Hydration is easy to forget: If you forget to include <HydrateClient>, the client-side component may trigger an additional request to fetch data, which defeats the purpose of prefetching.

## When to Use <HydrateClient>

Always use <HydrateClient> when you’re dealing with .prefetch() calls, especially for pages where data is fetched on the server and passed down to the client component for rendering.

## Key Benefits:

- Improves performance by reducing unnecessary API calls.
- Ensures data consistency between server-side and client-side rendering.
- Avoids redundant fetches by allowing the client to immediately use the prefetched data.
