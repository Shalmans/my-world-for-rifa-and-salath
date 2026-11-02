-- ============================================================================
--  Run this ONCE in your Supabase project (ykfrdowilzftpdikygvt).
--  Dashboard → SQL Editor → New query → paste all of this → Run.
--
--  It creates the tables the app needs. Only the server (secret /
--  service_role key) can read or write them — the publishable key cannot,
--  so the data stays private. The /admin dashboard reads it through the
--  server.
--
--  Safe to re-run: every statement is idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Roles (used by the one-time admin bootstrap in admin.functions.ts)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin');
  end if;
end $$;

create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all    on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant  execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. The answers table
-- ---------------------------------------------------------------------------
create table if not exists public.birthday_quiz_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default 'Rifa',
  answers      jsonb not null,
  submitted_at timestamptz not null default now()
);

grant all on public.birthday_quiz_submissions to service_role;

-- Lock the table: RLS on, no policy for anon/authenticated, so the
-- publishable key gets nothing. The secret key used by the app's server
-- functions bypasses RLS, so saving and the dashboard still work.
alter table public.birthday_quiz_submissions enable row level security;

drop policy if exists "Anyone can submit answers"    on public.birthday_quiz_submissions;
drop policy if exists "Admins can read submissions"  on public.birthday_quiz_submissions;
drop policy if exists "Admins can delete submissions" on public.birthday_quiz_submissions;

-- ---------------------------------------------------------------------------
-- 3. Make PostgREST pick up the new tables immediately
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';
