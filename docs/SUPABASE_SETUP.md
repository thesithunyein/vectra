# Supabase setup (plant data + telemetry)

Vectra uses Supabase for **auth** and **cloud plant workspaces**. Run this once per project.

## 1. Create tables

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste and run [`supabase/schema.sql`](../supabase/schema.sql)

This creates:

- `plant_workspaces` — devices, alerts, maintenance, records (JSONB per user)
- `plant_api_keys` — telemetry ingest keys
- `plant_telemetry_log` — ingest audit log
- Row Level Security policies

## 2. Environment variables

**Vercel / `.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server only — required for telemetry ingest API
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Find the service role key under **Project Settings → API**. Never expose it to the browser.

## 3. Verify

1. Sign in with Google or email (not wallet-only)
2. Settings → **Import your plant** or load example data then import
3. Settings → **Connect a line** → copy API key
4. **Send test signal** → new alert appears on Alerts

## Telemetry ingest

```bash
curl -X POST https://vectra.sithunyein.com/api/telemetry/ingest \
  -H "Authorization: Bearer vk_..." \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"SMT-01","metric":"reject_rate","value":4.2,"threshold":3.0}'
```

`deviceId` must exist in your plant workspace.

## Wallet sign-in

Wallet sessions use browser storage only. Use Google/email for cloud sync and telemetry keys.
