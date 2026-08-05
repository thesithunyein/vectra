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

## 4. Enable Google (recommended — also unlocks Gmail photo)

Same providers page → **Google** → Enable

Your Supabase project: `ahaousuahjwavkmaezdu`  
Callback URL you must paste into Google:

`https://ahaousuahjwavkmaezdu.supabase.co/auth/v1/callback`

### Step A — Google Cloud

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create project (or pick one) → **Create credentials** → **OAuth client ID**
3. If asked, configure OAuth consent screen (External, app name `Vectra`, your email)
4. Application type: **Web application**
5. Name: `Vectra`
6. **Authorized JavaScript origins**
   - `http://localhost:3000`
   - `https://vectra.sithunyein.com`
7. **Authorized redirect URIs**
   - `https://ahaousuahjwavkmaezdu.supabase.co/auth/v1/callback`
8. Create → copy **Client ID** and **Client Secret**

### Step B — Supabase

1. Open [Auth → Providers → Google](https://supabase.com/dashboard/project/ahaousuahjwavkmaezdu/auth/providers)
2. Enable Google
3. Paste Client ID + Client Secret
4. Save

### Step C — Test

1. Open https://vectra.sithunyein.com/login
2. Click **Continue with Google**
3. Top bar should show your **Gmail name + profile photo** (not initials)

Email/password accounts never get a Google photo — that is expected.

### Fix: `Unable to exchange external code`

This error means Google returned a code, but **Supabase could not trade it for tokens**. Almost always credentials / redirect mismatch.

Checklist (do in order):

1. Google Cloud OAuth client type must be **Web application** (not Desktop / iOS / Android).
2. Google **Authorized redirect URIs** must include **exactly**:
   `https://ahaousuahjwavkmaezdu.supabase.co/auth/v1/callback`
   - Do **not** put `https://vectra.sithunyein.com/auth/callback` here.
3. In Supabase → Auth → Providers → Google:
   - Paste the **same** Client ID and Client Secret from that Web client
   - If you regenerated the secret in Google, paste the new secret again
4. Save Supabase Google provider, wait ~10s, retry Google sign-in in a fresh tab (or clear site cookies for vectra.sithunyein.com).
5. Confirm Site URL is `https://vectra.sithunyein.com` and Redirect URLs include `https://vectra.sithunyein.com/auth/callback`.

## 5. Add redirect URLs in Supabase

Open: [https://supabase.com/dashboard/project/_/auth/url-configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)

Site URL (prod):

- `https://vectra.sithunyein.com`

Redirect URLs allow list:

- `http://localhost:3000/auth/callback`
- `https://vectra.sithunyein.com/auth/callback`

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
