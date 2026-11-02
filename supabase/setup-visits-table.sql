-- ============================================================================
--  Visitor counter — run this ONCE in your Supabase project.
--  Dashboard → SQL Editor → New query → paste all of this → Run.
--
--  One row per *person*, not per page load. The same browser coming back 10
--  times updates the same row and bumps visit_count, so the dashboard can show
--  "1 visitor, 10 opens" instead of "10 visitors".
--
--  Only the server (secret / service_role key) can read or write this table.
--  Safe to re-run: every statement is idempotent.
-- ============================================================================

create table if not exists public.site_visitors (
  id            uuid        primary key default gen_random_uuid(),
  -- Random id kept in the visitor's browser (localStorage). The identity.
  visitor_id    text        not null unique,
  -- Hash of IP + device signature. Backup identity for when the browser
  -- storage is wiped (or private mode), so the same phone isn't re-counted.
  fingerprint   text,
  visit_count   integer     not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  device        text,
  browser       text,
  os            text,
  screen        text,
  timezone      text,
  language      text,
  referrer      text,
  country       text,
  region        text,
  city          text,
  user_agent    text
);

create index if not exists site_visitors_fingerprint_idx on public.site_visitors (fingerprint);
create index if not exists site_visitors_last_seen_idx   on public.site_visitors (last_seen_at desc);

grant all on public.site_visitors to service_role;

-- Lock the table: RLS on with no policy for anon/authenticated, so the
-- publishable key gets nothing. The secret key used by the server functions
-- bypasses RLS, so tracking and the dashboard still work.
alter table public.site_visitors enable row level security;

-- Make PostgREST pick up the new table immediately
notify pgrst, 'reload schema';
