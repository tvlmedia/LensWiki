# LensWiki Supabase Admin Setup

LensWiki will keep the public GitHub Pages site on curated JSON files for now. This Supabase foundation is only for a future private admin workflow.

## Shared Project Setup

Use the existing shared Supabase project. Do not create a new paid project just for LensWiki unless the project later needs its own isolated database.

The migration uses `lenswiki_` prefixes for LensWiki tables and helpers so they can live safely next to tables from other apps:

- `public.lenswiki_admins`
- `public.lenswiki_records`
- `public.lenswiki_record_edits`
- `public.is_lenswiki_admin()`

## Run the Migration

1. Open the existing Supabase project.
2. Go to the SQL Editor.
3. Paste and run `supabase/migrations/001_lenswiki_admin_foundation.sql`.
4. Confirm the three `lenswiki_` tables were created.
5. Confirm Row Level Security is enabled on all three tables.

## Create Your Admin User

1. In Supabase, enable email/password auth if it is not already enabled.
2. Create or use your own Auth user.
3. Copy that user's `id` from Supabase Auth.
4. Add yourself to `public.lenswiki_admins`:

```sql
insert into public.lenswiki_admins (user_id, email, role)
values ('YOUR_AUTH_USER_ID', 'you@example.com', 'admin');
```

Only users listed in `public.lenswiki_admins` should be able to manage private LensWiki records and edit logs.

## Key Safety Rules

- Never expose the Supabase `service_role` key in browser code, GitHub Pages, commits, screenshots, or public documentation.
- Browser code may only use the anon/public/publishable key, with Row Level Security enabled.
- Admin editing must happen only after login.
- Public reads from Supabase should only expose records where `status` is `published` or `ready`.
- The public LensWiki site still loads from `data/lenses/` JSON files for now. Do not migrate public loading to Supabase until the admin UI and publishing workflow are ready.

## What This Adds

The migration prepares:

- Admin membership through `public.lenswiki_admins`
- Future editable lens records in `public.lenswiki_records`
- Audit/edit history in `public.lenswiki_record_edits`
- RLS policies that keep public access read-only and limited to published/ready records

No admin UI, Supabase keys, or public-site data-loading changes are included in this step.
