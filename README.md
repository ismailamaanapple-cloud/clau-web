This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Login & cloud sync (Supabase)

The app works with **no setup** — without Supabase it runs in "guest mode" and
saves everything to the browser's localStorage. To enable real **login** and
**cloud sync** (so a user's profile, portfolio, and saved scenarios follow them
across devices), do the following once:

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Create the database table.** In the Supabase Dashboard → **SQL Editor** →
   New query, paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**. This creates the `profiles` table the app reads/writes and
   locks it down with row-level security (each user only sees their own data).
3. **Add your API keys.** In Dashboard → **Project Settings → API**, copy the
   *Project URL* and the *anon public* key. Then:
   - **Locally:** `cp .env.local.example .env.local` and fill in both values.
   - **On Vercel:** Project → Settings → Environment Variables, add
     `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then redeploy.
4. **Enable sign-in methods.** In Dashboard → **Authentication → Providers**,
   enable Email, and optionally **Google** and **Apple** (the app already has
   buttons for all three). For Google/Apple, follow Supabase's provider guide and
   add `https://<your-domain>/auth/callback` as an allowed redirect URL under
   **Authentication → URL Configuration**.

That's it — once the env vars are present the login UI activates automatically
and profiles start syncing to the cloud.

Locally the dev server runs on port **3001** (`npm run dev`).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
