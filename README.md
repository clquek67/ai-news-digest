# AI News Digest

Crawls AI industry news via Claude's web search, ranks the top 5 highest-impact
stories, and emails you a digest every ~3 days.

## How the cadence actually works

Vercel Cron can't express "every 3 days" as a true rolling interval (day-of-month
based cron patterns reset each month). Instead:

- Vercel Cron triggers this endpoint **daily** at 09:00 UTC (`vercel.json`).
- The route checks `digest_log` in Supabase for the last `sent_at` timestamp.
- It only actually generates + sends if ≥72 hours have passed. Otherwise it
  exits as a no-op. This gives you a real 3-day cadence regardless of month
  boundaries.

## Setup

1. `npm install`
2. Create the Supabase table:
   ```
   Run supabase-schema.sql in your Supabase SQL editor
   ```
3. Copy `.env.example` to `.env.local` and fill in:
   - `ANTHROPIC_API_KEY` — your Claude API key
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings
   - `RESEND_API_KEY` — from resend.com (verify your sending domain there first)
   - `EMAIL_FROM` / `EMAIL_TO`
   - `CRON_SECRET` — any random string, e.g. `openssl rand -hex 32`
4. Test locally without waiting 3 days:
   ```
   npm run dev
   # in another terminal:
   npm run test:digest
   ```
   (`?force=true` bypasses both the auth check and the 3-day gate)
5. Deploy:
   ```
   vercel deploy --prod
   ```
6. In Vercel project settings → Environment Variables, add the same vars from
   `.env.local`, including `CRON_SECRET`. Vercel automatically calls your cron
   route with `Authorization: Bearer $CRON_SECRET`.

## Tuning relevance

Edit `FOCUS_AREAS` in `lib/generate-digest.ts` — this is the main lever for
which stories get surfaced. It currently weights toward infra ops automation
and solo-founder AI tooling; adjust freely.

## About the "suggested_take" field

Claude drafts an opinionated angle on each story, clearly labeled "Draft take
(edit me)" in the email. It's not your actual opinion — just a starting point
so the email isn't purely neutral summary. Treat it as a first draft, not a
final word.

## Cost note

Each run makes one Claude API call with web search enabled (multiple search
queries may execute server-side per call, each billed separately from output
tokens). Check current Anthropic API pricing for web search before leaving
this running indefinitely.
