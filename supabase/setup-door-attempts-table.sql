-- ============================================================================
--  Secret-door log — run this ONCE in your Supabase project.
--  Dashboard → SQL Editor → New query → paste all of this → Run.
--
--  One row per PIN attempt, right or wrong, with the time it happened and the
--  device it came from. This is the "someone tried to get in" log behind the
--  Door tab in /admin.
--
--  The digits typed are stored ONLY for a wrong attempt — a correct one would
--  mean writing the real PIN into the database, so that column stays null.
--
--  Only the server (secret / service_role key) can read or write this table.
--  Safe to re-run: every statement is idempotent.
-- ============================================================================

create table if not exists public.door_attempts (
  id           uuid        primary key default gen_random_uuid(),
  attempted_at timestamptz not null default now(),
  success      boolean     not null,
  -- What was typed. Null on success, and on failure only ever a wrong number.
  entered      text,
  -- Which try this was in one sitting: 1 = the first attempt after arriving.
  attempt_no   integer,
  -- Matches site_visitors.visitor_id when the browser carries one, so a run of
  -- attempts can be tied back to a single person.
  visitor_id   text,
  device       text,
  browser      text,
  os           text,
  screen       text,
  timezone     text,
  language     text,
  country      text,
  region       text,
  city         text,
  user_agent   text
);

create index if not exists door_attempts_attempted_at_idx on public.door_attempts (attempted_at desc);
create index if not exists door_attempts_visitor_idx      on public.door_attempts (visitor_id);

grant all on public.door_attempts to service_role;

-- Lock the table: RLS on with no policy for anon/authenticated, so the
-- publishable key gets nothing. The secret key used by the server functions
-- bypasses RLS, so logging and the dashboard still work.
alter table public.door_attempts enable row level security;

-- Make PostgREST pick up the new table immediately
notify pgrst, 'reload schema';
