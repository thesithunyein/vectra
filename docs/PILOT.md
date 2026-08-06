# Vectra 90-day pilot roadmap

Industrial 5.0 shift console for manufacturing plants in **Malaysia and Southeast Asia**.

## Phase 1 — Shift console (now)

- Google / email auth, plant workspace
- Excel/CSV import for machines, alerts, maintenance
- AI alert briefs (OpenAI + deterministic fallback)
- Maintenance close-out with signed records
- Solana integrity attestation (devnet → mainnet-ready pattern)
- HTTP telemetry ingest (`POST /api/telemetry/ingest`)
- Supabase cloud persistence per plant

**Target user:** Ops Lead + Maintenance Supervisor on one SMT/assembly line.

## Phase 2 — Line connect (days 30–60)

- MQTT / webhook adapter → telemetry API
- Threshold rules per machine metric
- Multi-shift user roles (read-only vendor view)
- Email/Slack alert fan-out
- Move attestation wallet to mainnet for pilot customers

**Target:** 1 paying pilot plant, 1 line, 2 shifts.

## Phase 3 — Plant scale (days 60–90)

- OPC-UA / MES read-only connector
- Vendor SLA module (dispute resolution from sealed records)
- Per-site billing (SaaS)
- Analytics fed from live telemetry (not static KPIs)

**Target:** 3 plants, RM recurring per site.

## Risks

| Risk | Mitigation |
|------|------------|
| Plants want PLC integration day one | Telemetry API + CSV today; MQTT adapter next |
| Web3 skepticism | Product works without chain; attest is optional proof |
| Data residency | Supabase region selection + export on request |

## Success metrics (pilot)

- Time from drift signal → assigned alert **< 5 min**
- Shift handoff disputes **↓** (vendor verifies sealed record)
- Maintenance close-out with reason code **100%** on pilot line
