-- Run this once in your Supabase SQL editor

create table if not exists digest_log (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz not null default now(),
  item_count int not null default 0,
  raw_json jsonb
);

-- Seed one row so the very first cron run has something to compare against.
-- (Skip this if you want the very first run to fire immediately.)
insert into digest_log (sent_at, item_count) values (now() - interval '3 days', 0);
