# Vectra Auth Setup (Supabase free)

Real sign in for plant users: **Google** + **email/password**.
No Farah demo account.

## 1. Create free Supabase project

Open: [https://supabase.com/dashboard](https://supabase.com/dashboard)

1. Click **New project**
2. Name it `vectra`
3. Set a database password (save it)
4. Choose a region close to you
5. Wait until the project is ready

## 2. Copy API keys

Open: [https://supabase.com/dashboard/project/_/settings/api](https://supabase.com/dashboard/project/_/settings/api)

Copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Enable Email auth

Open Authentication providers:

[https://supabase.com/dashboard/project/_/auth/providers](https://supabase.com/dashboard/project/_/auth/providers)

- Keep **Email** enabled
- Confirm email can stay ON for production (or turn off Confirm email for faster testing)

## 4. Enable Google (recommended for judges + real users)

Same providers page → **Google** → Enable

You need Google Cloud OAuth credentials:

1. Open Google Cloud Console credentials:  
   [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create **OAuth client ID** → Web application
3. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://vectra-app-khaki.vercel.app`
   - Your Supabase URL, e.g. `https://YOUR_PROJECT.supabase.co`
4. Authorized redirect URIs (important):
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Copy Client ID + Client Secret into Supabase Google provider settings
6. Save

Supabase Google docs:  
[https://supabase.com/docs/guides/auth/social-login/auth-google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 5. Add redirect URLs in Supabase

Open: [https://supabase.com/dashboard/project/_/auth/url-configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)

Site URL:

- Local: `http://localhost:3000`
- Prod: `https://vectra-app-khaki.vercel.app`

Redirect URLs allow list:

- `http://localhost:3000/auth/callback`
- `https://vectra-app-khaki.vercel.app/auth/callback`

## 6. Add env vars

### Local `.env.local`

```bash
NEXT_PUBLIC_APP_NAME=Vectra
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Vercel

[https://vercel.com/sithu-nyeins-projects/vectra-app/settings/environment-variables](https://vercel.com/sithu-nyeins-projects/vectra-app/settings/environment-variables)

Add the same three `NEXT_PUBLIC_*` values for Production, then Redeploy.

Or paste keys here in chat and ask me to set them with the Vercel CLI.

## 7. Test

1. Open `/login`
2. **Continue with Google** or create email account
3. Top bar shows **your real name + email**
4. Closing maintenance seals a record under **your name**

## Why this helps the bounty

- Real users, not a fake Farah login
- Web2-friendly Google/email (non-crypto)
- Matches Industrial 5.0 “useful for real users”
- Free Supabase Auth + free Vercel
