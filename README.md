# SaaS Starter ID

**An Indonesian SaaS starter kit** — Next.js + authentication + database +
**Midtrans** payments (QRIS, e-wallets, bank transfer, cards), wired end to
end so you can start building your product instead of boilerplate.

Most SaaS starters hard-wire Stripe, which Indonesian founders cannot use
without a foreign entity. This starter uses [Midtrans](https://midtrans.com)
— the payment gateway Indonesian users actually pay with — including a
signature-verified notification webhook that activates subscriptions.

> Starter ini berbahasa Indonesia di antarmukanya dan memakai Midtrans
> sebagai gerbang pembayaran. Baca **Mulai Cepat** di bawah untuk menjalankannya.

## What's inside

- **Next.js 15** (App Router, TypeScript) + Tailwind CSS
- **Auth.js (NextAuth v5)** — email + password registration/login, optional
  Google sign-in
- **Prisma + SQLite** for local dev (switch one line to PostgreSQL/MySQL)
- **Midtrans Snap checkout** — no SDK dependency, plain Snap API client
- **Verified webhook** at `/api/webhooks/midtrans`: SHA-512 signature check
  + amount check before any order is marked paid
- **Plans & subscriptions** — edit `src/lib/plans.ts`, pay, and the
  subscription activates automatically on settlement
- Pages: landing, pricing, login/register, and a protected dashboard that
  shows subscription status and recent orders

## Quick start

```bash
git clone https://github.com/ryoangriawan96/saas-starter-id.git
cd saas-starter-id
npm install
cp .env.example .env   # fill in the values (see below)
npm run db:push        # create the local SQLite database
npm run dev            # http://localhost:3000
```

### Environment variables

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Default `file:./dev.db` works for local dev |
| `AUTH_SECRET` | `npx auth secret` or `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional — Google Cloud Console OAuth client |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` | Midtrans dashboard → Settings → Access Keys. Start with **Sandbox** keys (`SB-…`) |
| `MIDTRANS_IS_PRODUCTION` | `false` while testing |
| `NEXT_PUBLIC_APP_URL` | Your app's base URL |

### Connect the Midtrans webhook

In the Midtrans dashboard (Sandbox first): **Settings → Configuration →
Payment Notification URL**, set:

```
https://<your-domain>/api/webhooks/midtrans
```

For local testing, expose your dev server with a tunnel (e.g. ngrok) and use
that URL. Without the webhook, orders stay `PENDING` and subscriptions never
activate — by design, the webhook is the only source of truth for payment.

## How payments flow

1. User picks a plan on `/pricing` → `POST /api/checkout` creates an
   `Order` (status `PENDING`) and a Snap transaction, then redirects to
   Midtrans.
2. User pays with QRIS / e-wallet / bank transfer / card.
3. Midtrans calls `/api/webhooks/midtrans`. The handler verifies the
   signature and the amount, marks the order `PAID`, and creates/renews the
   user's `Subscription`.
4. `/dashboard` reads the subscription and shows it as active.

## Project layout

```
prisma/schema.prisma          User, Order, Subscription models
src/auth.ts                   Auth.js configuration
src/lib/midtrans.ts           Snap client + signature verification
src/lib/plans.ts              Plans & pricing (edit me)
src/app/pricing/              Pricing page with checkout buttons
src/app/api/checkout/         Creates orders + Snap transactions
src/app/api/webhooks/midtrans Payment notification handler
src/app/dashboard/            Protected user dashboard
```

## Going to production

- Use a production database (PostgreSQL/MySQL) and run migrations.
- Set `MIDTRANS_IS_PRODUCTION=true` and use production Midtrans keys.
- Set a strong `AUTH_SECRET` and your real `NEXT_PUBLIC_APP_URL`.
- Never commit `.env`.

## Related

- [midtrans-mcp](https://github.com/ryoangriawan96/midtrans-mcp) — an MCP
  server for Midtrans, by the same author.

## License

MIT © Ryo Angriawan
