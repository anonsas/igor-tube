# 🎬 Igor Tube - YouTube Clone

A modern, full-stack, YouTube-inspired video-sharing platform built with Next.js 15, MUX, and a powerful edge-first architecture.  
Focus on seamless video streaming, secure uploads, and personalized user experiences.

---

## 🚀 Features

- Video streaming with MUX Player
- Secure video uploads
- Authentication & user management (Clerk)
- Type-safe APIs with tRPC
- Serverless Postgres (Neon)
- Edge caching & rate limiting (Upstash Redis)
- Comments, likes, and subscriptions
- Modern UI with TailwindCSS & Shadcn
- Fully responsive & mobile-friendly
- Efficient form handling with React Hook Form

---

## 🛠 Tech Stack & Why I Chose It

| Tech                                       | Why I Use It                                          |
| ------------------------------------------ | ----------------------------------------------------- |
| **Next.js v15**                            | Full-stack flexibility, App Router, SSR, SEO-friendly |
| **TailwindCSS**                            | Utility-first, rapid styling                          |
| **Shadcn UI**                              | Accessible, modern UI components                      |
| **Zod**                                    | Type-safe schema validation                           |
| **React Hook Form**                        | Lightweight & performant form handling                |
| **Upstash Redis**                          | Edge-first caching & rate limiting                    |
| **tRPC (`@trpc/client` & `@trpc/server`)** | Type-safe, boilerplate-free APIs                      |
| **Clerk**                                  | Authentication, social login, user profiles           |
| **Neon Database**                          | Serverless Postgres with branching                    |
| **TanStack React Query**                   | Data fetching, caching, and state synchronization     |
| **MUX Player & Uploader**                  | Video streaming & secure uploading                    |
| **UploadThing + Upstash Rate Limit**       | Secure uploads with rate limiting                     |
| **Drizzle ORM**                            | Type-safe SQL queries with modern DX                  |

---

## 💾 Installation

```bash
git clone https://github.com/yourusername/igor-tube.git
cd igor-tube
pnpm install
```

## Setup Environment Variables

Create a .env.local file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 🛠 Running Locally

```bash
pnpm run dev
```

App will run at: http://localhost:3000
