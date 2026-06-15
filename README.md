# Tech Solutions Pakistan

Premium digital agency platform — a phased build on **Next.js 15 + Appwrite Cloud**.

This repository currently contains **Stage 1**: the public marketing website,
authentication, and lead generation. Stages 2 (client/expert portals + realtime
chat) and 3 (admin portal + AI assistant + finance) build on this foundation.

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind |
| Motion   | Framer Motion                                           |
| Charts   | Recharts (Stage 2/3)                                    |
| Backend  | Appwrite Cloud (Auth, DB, Storage, Functions, Realtime) |
| AI       | Google Gemini (via Appwrite Functions — Stage 3)        |
| Email    | Resend (via Appwrite Functions)                         |
| Hosting  | Vercel · Domain: tech-solutions.site                    |

## Stage 1 features

- ✅ Premium "Aura" marketing site (hero with rotating services + live stats,
  trusted partners marquee, 6 services, 8 portfolio case studies, 10 testimonials,
  founder/leadership section, dynamic experts directory, contact form)
- ✅ Guided button-driven **lead chatbot** (service → budget → timeline →
  description → contact → summary → submit)
- ✅ **Authentication**: register, login, Google OAuth, forgot/reset password,
  session management, role logic (client / expert / admin; owner email → admin)
- ✅ SEO: metadata, Open Graph, `robots.txt`, `sitemap.xml`
- ✅ Fully responsive, dark aura theme

> **Demo mode:** the site runs without Appwrite configured — leads/contacts log
> to the console and the experts directory uses seed data. Add credentials to
> enable the real backend.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Appwrite IDs
npm run dev                         # http://localhost:3000
```

## Appwrite setup

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io) and add a
   **Web platform** with hostname `localhost` (and your Vercel domain).
2. Put your project ID in `.env.local` (`NEXT_PUBLIC_APPWRITE_PROJECT_ID`) and
   set `NEXT_PUBLIC_OWNER_EMAIL` — that account auto-promotes to `admin`.
3. **Provision the backend automatically.** Create an API key (Overview → API
   keys) with `databases`, `collections`, `attributes`, `indexes`, `documents`,
   and `buckets` read/write scopes, then run:

   ```bash
   APPWRITE_PROJECT_ID=xxx APPWRITE_API_KEY=xxx npm run setup:appwrite
   ```

   This idempotently creates the database `tsp_main`, all Stage 1 collections
   (with attributes, indexes, and permissions), the storage buckets, and seeds
   the experts directory. Safe to re-run.

   The collections it creates:
   - `lead_requests` — service, budget, timeline, description, name, email, status
   - `contacts` — name, email, subject, message
   - `experts` — name, role, skills (string[]), avatarUrl, visibleOnHomepage (bool)
   - `profiles` — userId, name, email, role, company, phone

4. Enable **Google OAuth** under Auth → Settings.
5. Create a team named `admin` and add the owner account to it (collection
   permissions grant admins read/write to leads, contacts, and experts).

> The `APPWRITE_API_KEY` is server-only — never commit it or expose it to the
> browser. It is used solely by the provisioning script.

Server-only secrets (`RESEND_API_KEY`, `GEMINI_API_KEY`, `APPWRITE_API_KEY`)
live inside Appwrite Function environment variables — never in the frontend.

## Deployment

Push to GitHub and import into Vercel. Add all `NEXT_PUBLIC_*` variables in the
Vercel project settings, then connect the `tech-solutions.site` domain.

```bash
git remote add origin https://github.com/musadiqqureshi/Tech-Solution-New.git
git branch -M main
git push -u origin main
```
