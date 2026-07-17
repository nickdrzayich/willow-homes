# Bid Tracker

A mobile-friendly web app for tracking subcontractor bids across home-build projects — replaces a spreadsheet-based bidding workflow with real company records, shareable projects, and live totals.

Stack: Next.js 16 (App Router) + Supabase (Postgres, Auth, Row Level Security) + Tailwind/shadcn, deployed on Vercel.

## First-time setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. In **Project Settings → API**, copy the **Project URL**, **anon public key**, and **service_role key**.
3. Fill in `.env.local` (already gitignored) with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. Apply the database schema

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # found in the Supabase dashboard URL
npx supabase db push                                   # applies supabase/migrations/*.sql
```

This creates all tables, the `project_totals` view, and Row Level Security policies.

### 3. Regenerate typed database types (optional but recommended)

`lib/types.ts` is hand-written to match the migrations. Once linked, you can replace it with real generated types:

```bash
npx supabase gen types typescript --linked > lib/types.ts
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up for an account (email/password), and you'll land on an empty project dashboard.

### 5. Import the real Pescara 8/1 data (optional)

Once you've signed up in the app with `info@willowhomesco.com` (or pass `--owner-email`):

```bash
npm run import:pescara              # dry run — prints a summary, writes nothing
npm run import:pescara -- --commit  # actually creates the project/trades/bids
```

The script reads trade names, bid amounts, bid status (from cell color), and company names (from Excel comments) directly out of the original `.xlsx`. Review the dry-run summary — especially any "needs manual review" rows — before committing.

### 6. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the same three env vars from `.env.local` in the Vercel project settings.
4. Deploy. The resulting URL works from any browser, including iPhone Safari.

## Project structure

- `app/(app)/` — authenticated pages (projects, companies, members)
- `app/login`, `app/signup` — auth pages
- `lib/actions/` — Server Actions (all mutations)
- `lib/supabase/` — Supabase client helpers + session-refresh logic (`proxy.ts`, Next 16's replacement for `middleware.ts`)
- `supabase/migrations/` — versioned SQL schema + RLS policies
- `scripts/import-pescara.ts` — one-time spreadsheet import
