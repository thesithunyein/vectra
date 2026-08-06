# Contributing to Vectra

Thanks for helping improve Vectra. This project is open source under the [MIT License](LICENSE).

## Before you start

- Read the [README](README.md) for product context and architecture.  
- Auth setup: [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)  
- Security: [SECURITY.md](SECURITY.md)

## Development setup

```bash
git clone https://github.com/thesithunyein/vectra.git
cd vectra
npm install
cp .env.example .env.local
# Fill Supabase keys; optional OpenAI + Solana for full feature testing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pull requests

1. Fork the repo and create a branch from `main`.  
2. Keep changes focused — one feature or fix per PR.  
3. Match existing code style (TypeScript, Tailwind, minimal comments).  
4. Run `npm run lint` and `npm run build` before opening the PR.  
5. Describe **what** changed and **why** in the PR body.

## Commit messages

Use clear, imperative summaries:

- `Add CSV validation for device imports`  
- `Fix light-mode logo contrast on landing marquee`

## What we’re looking for

- Bug fixes with reproduction steps  
- Import/export improvements for plant data  
- Accessibility and UX polish on the ops console  
- Tests for parsers (`import-csv`, `import-workbook`)  
- Documentation corrections

## What to avoid

- Committing secrets or `.env.local`  
- Large unrelated refactors in the same PR  
- Breaking changes to auth or record sealing without discussion

## Questions

Open a [GitHub Discussion](https://github.com/thesithunyein/vectra/discussions) or an issue labeled `question`.
