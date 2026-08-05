<p align="center">
  <img src="public/logo.png" alt="Vectra" width="80" height="80" />
</p>

<h1 align="center">Vectra</h1>

<p align="center">
  <strong>Industrial Monitoring</strong><br />
  Downtime response and signed shift handoffs for manufacturing plants.
</p>

<p align="center">
  <img alt="Integrity" src="https://img.shields.io/badge/Integrity-sealed%20records-0066FF?style=flat-square" />
  <img alt="Auth" src="https://img.shields.io/badge/Auth-Google%20%2B%20Email-111827?style=flat-square" />
  <img alt="Stack" src="https://img.shields.io/badge/Stack-Next.js%20·%20Supabase-0A0A0A?style=flat-square" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Live-10B981?style=flat-square" />
</p>

<p align="center">
  <a href="https://vectra.sithunyein.com"><strong>Live product →</strong></a>
  ·
  <a href="https://vectra.sithunyein.com/login">Sign in</a>
</p>

---

## Why Vectra

Plant teams lose time when downtime is found late and handoffs live in chat threads. Vectra gives Ops and Maintenance one console to:

- Catch **early warnings** from line baseline drift  
- Draft an **AI brief** (what’s wrong, likely cause, next action) — humans still decide  
- Close jobs with reason codes  
- Seal **signed records** and **attest the integrity hash on Solana** so the next shift can verify  

Real users sign in with **Google** or work email. New workspaces start empty. Example plant data is optional for walkthroughs before machines are connected.

## Architecture

```mermaid
flowchart LR
  subgraph Users
    U[Ops / Maintenance]
  end

  subgraph Vectra
    A[Auth<br/>Google · Email]
    C[Live console]
    AI[AI alert brief]
    M[Maintenance close]
    R[Signed records]
  end

  subgraph Trust
    S[Integrity seal]
    CH[Solana memo attest]
  end

  U --> A --> C
  C -->|Early warning| AI
  AI --> M
  M -->|Close & sign| R
  R --> S --> CH
  CH -->|Verify handoff| U
```

## Product loop

```mermaid
sequenceDiagram
  participant Line as Plant line
  participant Vectra as Vectra
  participant User as Signed-in user
  participant Night as Next shift / vendor

  Line->>Vectra: Baseline drift signal
  Vectra->>User: Early warning alert
  User->>Vectra: Assign / close maintenance
  Vectra->>Vectra: Seal record under user name
  Night->>Vectra: Open Records · integrity check
```

## Features

| Area | What you get |
|------|----------------|
| Overview | Shift board, KPIs, open critical alerts |
| Devices | Machine and line status |
| Alerts | Acknowledge, assign, resolve · early warning · **AI brief** |
| Analytics | Efficiency, energy, downtime views |
| Maintenance | Close with reason · seals a record |
| Records | Signed handoffs · integrity check · **Solana proof link** |
| Reports | Weekly CSV export |
| Settings | Plant identity, theme, example dataset |

## Stack

- **App:** Next.js · TypeScript · Tailwind · Recharts · Framer Motion  
- **Auth:** Supabase Auth (Google OAuth + email/password)  
- **Deploy:** Vercel · [vectra.sithunyein.com](https://vectra.sithunyein.com)

## Quick start

```bash
git clone https://github.com/thesithunyein/vectra.git
cd vectra
npm install
cp .env.example .env.local   # if present; or set vars below
npm run dev
```

Required env:

```bash
NEXT_PUBLIC_APP_NAME=Vectra
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...                 # server only — AI briefs
SOLANA_SECRET_KEY=[...]            # server only — JSON byte array keypair
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
```

Fund the Solana attestation wallet on [devnet faucet](https://faucet.solana.com) before closing maintenance records.

Auth setup: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)

## Links

| | |
|--|--|
| Product | https://vectra.sithunyein.com |
| Repository | https://github.com/thesithunyein/vectra |

## Brand

- **Name:** Vectra  
- **Subtitle:** Industrial Monitoring  
- **Mark:** `public/logo.png`  
- **Accent:** `#0066FF`
