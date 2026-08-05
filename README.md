# Vectra

<p align="center">
  <img src="public/logo.png" alt="Vectra" width="72" height="72" />
</p>

**Vectra** · Industrial Monitoring

Live ops console for manufacturing plants. Respond to downtime fast and leave signed shift handoffs crews and vendors can trust.

## Product

- Live ops console (Overview, Devices, Alerts, Analytics)
- Early warning alerts from baseline drift
- Maintenance close with reason codes
- Signed records with integrity check
- Weekly report export
- Dark / light mode

Built for plant teams. No wallet steps.

## Stack

- Next.js · TypeScript · Tailwind
- Recharts · Lucide · Framer Motion

## Live

- **Product:** [https://vectra-app-khaki.vercel.app](https://vectra-app-khaki.vercel.app)
- **GitHub:** [https://github.com/thesithunyein/vectra](https://github.com/thesithunyein/vectra)

Sign in with **Google** or create an email account (Supabase Auth). See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md).

App pages require a real signed-in user. Your name and email appear in the top bar.

## Run locally

```bash
cd C:\Users\sithu\Projects\vectra-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Core loop

1. Overview: open critical alert + downtime cost
2. Alerts: Early warning on AOI-01
3. Maintenance: Close & sign record
4. Records: Signed record with integrity check passed
5. Reports: Export weekly CSV

## Brand

- Product: **Vectra**
- Subtitle: **Industrial Monitoring**
- Logo: blue mark with white geometric A (`public/logo.png`)
- Accent: `#0066FF`
