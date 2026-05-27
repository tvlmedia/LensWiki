# LensWiki Admin Login Setup

The admin login page is a static GitHub Pages page that uses Supabase Auth. It checks whether the logged-in user exists in `public.lenswiki_admins`, then shows the LensWiki record dashboard.

## Configure Supabase

1. Open the existing shared Supabase project.
2. Go to Project Settings -> API.
3. Copy the Project URL.
4. Copy the anon/public/publishable key.
5. Put those values in `supabase-config.js`:

```js
window.LENSWIKI_SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
window.LENSWIKI_SUPABASE_ANON_KEY = "YOUR_ANON_OR_PUBLISHABLE_KEY";
```

Use only the anon/public/publishable key in browser code. Never use the `service_role` key in `supabase-config.js`, GitHub Pages, or any frontend file.

## Auth Redirect URLs

In Supabase Auth settings, make sure the redirect URLs include:

```text
https://tvlmedia.github.io/LensWiki/**
```

## Admin Access

1. Create or use a Supabase Auth user.
2. Run the LensWiki admin foundation migration if it has not been run yet.
3. Add your Auth user id to `public.lenswiki_admins`:

```sql
insert into public.lenswiki_admins (user_id, email, role)
values ('YOUR_AUTH_USER_ID', 'you@example.com', 'admin');
```

## Test Login

Open:

```text
https://tvlmedia.github.io/LensWiki/admin.html
```

Log in with the Supabase Auth user. If that user exists in `public.lenswiki_admins`, the page should show:

```text
Admin access confirmed.
```

If `supabase-config.js` still contains placeholders, the page will show a missing config message instead of enabling login.
