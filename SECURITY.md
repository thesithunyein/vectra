# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main` (latest deploy) | Yes |
| Older tags / forks | Best effort |

Production: [https://vectra.sithunyein.com](https://vectra.sithunyein.com)

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Report privately via a **[GitHub Security Advisory](https://github.com/thesithunyein/vectra/security/advisories/new)** on this repository.

Include:

1. Description of the issue and impact  
2. Steps to reproduce  
3. Affected routes, env vars, or components (if known)  
4. Your suggested fix (optional)

We aim to acknowledge reports within **72 hours** and share a remediation timeline when confirmed.

## Scope

In scope:

- Authentication and session handling (Supabase, wallet session)  
- API routes (`/api/alerts/brief`, `/api/records/attest`, `/api/telemetry/ingest`, `/api/plant`)  
- Secret handling (`OPENAI_API_KEY`, `SOLANA_SECRET_KEY`)  
- Cross-user data access in the app layer  
- On-chain attestation integrity

Out of scope:

- Denial-of-service against third parties (Supabase, OpenAI, Solana RPC)  
- Social engineering  
- Issues in dependencies without a demonstrable exploit path in Vectra  
- Missing security headers on unrelated infrastructure you do not control

## Secrets and deployment

- Never commit `.env.local` or key material. Use `.env.example` as reference only.  
- `OPENAI_API_KEY`, `SOLANA_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are **server-only**  
- Rotate keys immediately if leaked.

## Safe harbor

We appreciate responsible disclosure. Researchers who follow this policy will not be pursued for good-faith security research limited to their own accounts or explicit permission.
