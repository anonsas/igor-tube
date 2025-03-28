[⬅ Back](./trpc-client-server.md)

### tRPC v11 introduces the ability to prefetch authenticated data on the server.

Before this version, prefetching data that required authentication (like user-specific data) was more challenging because authentication was usually handled on the client. Now, with tRPC v11, you can fetch protected data directly inside a Server Component, meaning:

No need to wait for client-side authentication.

Faster page loads, since data is already available when rendering.

Better security, as sensitive requests don't have to go through the client first.

This is especially useful in Next.js with RSC, where you want to fetch data as early as possible without exposing API calls to the frontend.
