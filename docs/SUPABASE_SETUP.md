# Supabase setup (plant data + telemetry)

Vectra uses Supabase for **auth** and **cloud plant workspaces**. Run this once per project.

## 1. Create tables

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste and run [`supabase/schema.sql`](../supabase/schema.sql)
3. Then run [`supabase/schema-v2-tenants.sql`](../supabase/schema-v2-tenants.sql) for **multi-tenant teams + MQTT topics**

This creates:

- `plant_workspaces` — devices, alerts, maintenance, records (JSONB per user)
- `plant_api_keys` — telemetry ingest keys
- `plant_telemetry_log` — ingest audit log
- `plant_tenants`, `plant_members` — shared plant workspace per factory
- `plant_tenant_workspaces`, `plant_tenant_api_keys`, `plant_tenant_telemetry_log`
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
3. Settings → **Plant team** — invite ops/maintenance/vendor with invite code
4. Settings → **Connect a line** → copy API key + MQTT topic
5. **Send test signal** (HTTP) or run `services/mqtt-bridge` → new alert on Alerts

## MQTT ingest

Plant-scoped topic (shown in Settings):

```bash
mosquitto_pub -h test.mosquitto.org -t "vectra/plant/YOUR_SLUG/telemetry" \
  -m '{"deviceId":"SMT-01","metric":"reject_rate","value":4.2,"threshold":3.0}'
```

Or run the bridge: [`services/mqtt-bridge/README.md`](../services/mqtt-bridge/README.md)

## Telemetry ingest (HTTP)

```bash
curl -X POST https://vectra.sithunyein.com/api/telemetry/ingest \
  -H "Authorization: Bearer vk_..." \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"SMT-01","metric":"reject_rate","value":4.2,"threshold":3.0}'
```

`deviceId` must exist in your plant workspace.

## Wallet sign-in

Wallet sessions use browser storage only. Use Google/email for cloud sync and telemetry keys.
