[⬅ Back](./trpc-client-server.md)

### 🔄 Auto-Refresh

Auto-Refresh refers to keeping the client-side data in sync with the latest data from the server without a full page reload.

🔍 How does it work?

1️⃣ The Hydrate-Client component hydrates (restores) the React Query cache with data that was prefetched on the server.

2️⃣ If the data becomes stale or changes, React Query (which integrates with tRPC) can automatically re-fetch the latest data in the background.

3️⃣ This ensures that Client Components always display up-to-date data, even if the user has been on the page for a while.

✅ Why is this useful?

- Prevents showing outdated information to the user.
- Avoids extra network requests by using cached data until needed.
- Works well with features like real-time updates, polling, and revalidation.

💡 Think of it like auto-refreshing a dashboard without making the user manually refresh the pag
