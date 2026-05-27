-- LensWiki admin foundation for a shared Supabase project.
-- Public JSON loading remains the base archive; these tables power the private admin workflow.

create table if not exists public.lenswiki_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists public.lenswiki_records (
  id text primary key,
  slug text unique,
  name text not null,
  manufacturer text,
  year_introduced text,
  status text default 'draft',
  confidence text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.lenswiki_record_edits (
  id bigint generated always as identity primary key,
  lens_id text references public.lenswiki_records(id) on delete cascade,
  edited_by uuid references auth.users(id),
  edit_note text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz default now()
);

create index if not exists lenswiki_records_status_idx
  on public.lenswiki_records(status);

create index if not exists lenswiki_record_edits_lens_id_idx
  on public.lenswiki_record_edits(lens_id);

create or replace function public.is_lenswiki_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.lenswiki_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_lenswiki_admin() from public;
grant execute on function public.is_lenswiki_admin() to authenticated;

alter table public.lenswiki_admins enable row level security;
alter table public.lenswiki_records enable row level security;
alter table public.lenswiki_record_edits enable row level security;

drop policy if exists "LensWiki public can read published records"
  on public.lenswiki_records;
create policy "LensWiki public can read published records"
  on public.lenswiki_records
  for select
  using (status in ('published', 'ready'));

drop policy if exists "LensWiki admins can read all records"
  on public.lenswiki_records;
create policy "LensWiki admins can read all records"
  on public.lenswiki_records
  for select
  to authenticated
  using (public.is_lenswiki_admin());

drop policy if exists "LensWiki admins can insert records"
  on public.lenswiki_records;
create policy "LensWiki admins can insert records"
  on public.lenswiki_records
  for insert
  to authenticated
  with check (public.is_lenswiki_admin());

drop policy if exists "LensWiki admins can update records"
  on public.lenswiki_records;
create policy "LensWiki admins can update records"
  on public.lenswiki_records
  for update
  to authenticated
  using (public.is_lenswiki_admin())
  with check (public.is_lenswiki_admin());

drop policy if exists "LensWiki admins can delete records"
  on public.lenswiki_records;
create policy "LensWiki admins can delete records"
  on public.lenswiki_records
  for delete
  to authenticated
  using (public.is_lenswiki_admin());

drop policy if exists "LensWiki users can read own admin row"
  on public.lenswiki_admins;
create policy "LensWiki users can read own admin row"
  on public.lenswiki_admins
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "LensWiki admins can read admin rows"
  on public.lenswiki_admins;
create policy "LensWiki admins can read admin rows"
  on public.lenswiki_admins
  for select
  to authenticated
  using (public.is_lenswiki_admin());

drop policy if exists "LensWiki admins can read edit logs"
  on public.lenswiki_record_edits;
create policy "LensWiki admins can read edit logs"
  on public.lenswiki_record_edits
  for select
  to authenticated
  using (public.is_lenswiki_admin());

drop policy if exists "LensWiki admins can insert edit logs"
  on public.lenswiki_record_edits;
create policy "LensWiki admins can insert edit logs"
  on public.lenswiki_record_edits
  for insert
  to authenticated
  with check (public.is_lenswiki_admin());
