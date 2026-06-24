# Tech Solutions Pakistan — Project Status & Handoff

_Last updated: 2026-06-24. Use this to resume work in a new chat._

## 1. What this is
A single Next.js app that contains **three products**:
1. **Public marketing website** for Tech Solutions Pakistan (digital agency).
2. **Agency operations app** (`/app`) — client, expert, intern, and admin portals
   (orders, tasks, invoices, meetings, realtime chat, reviews, payroll).
3. **Multi-tenant SaaS platform** (`/company-register`, `/dashboard`, `/admin`) — IT
   companies subscribe and get an isolated workspace (clients/projects/tasks/team/
   invoices/tickets); a super-admin panel manages all companies.

Plus **Tech Solutions AI** (site-trained chatbot) and an **internship program**.

## 2. Stack & infra
- **Next.js 15** (App Router) · React 19 · TypeScript · Tailwind · Framer Motion · Recharts
- **Supabase** — auth, Postgres (RLS), Storage, Realtime. Project ref `lncpaplxvqvuyblmbucd` (URL `https://lncpaplxvqvuyblmbucd.supabase.co`).
- **AI** — OpenRouter (`/api/ai/chat`), model `cohere/north-mini-code:free` (reasoning model; route uses max_tokens 3000 + reasoning effort low + maxDuration 60).
- **Deploy** — Vercel, project `tech-solution-new`. Live: **https://tech-solution-new.vercel.app**
  (intended domain `tech-solutions.site` — NOT connected yet).
- **Repo** — `github.com/musadiqqureshi/Tech-Solution-New` (branch `main`). Local: `/Users/app/Downloads/Tech-Solution-New`.

### Commands
- `npm run dev` / `npm run build` / `npm start`
- `npm run setup:db` — applies `supabase/schema.sql` (idempotent) via `pg` using `SUPABASE_DB_URL`
- `npm run seed:users` — seeds admin + clients + experts + expert directory (service role)
- Deploy: `vercel --prod --yes --token=<VERCEL_TOKEN>`

### Env vars (in `.env.local` and Vercel)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_OWNER_EMAIL=admin@techsolutions.test`,
`NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server), `SUPABASE_DB_URL` (server, migrations),
`GEMINI_API_KEY` (old Aura assistant), `AI_API_KEY` (OpenRouter), `AI_BASE_URL=https://openrouter.ai/api/v1`,
`AI_MODEL=cohere/north-mini-code:free`.

### Test logins (password: `TspSample@2026`)
- Admin: `admin@techsolutions.test`
- Clients: `ayesha.khan@`, `bilal.saeed@`, `fatima.noor@`, `omar.sheikh@`, `zoya.malik@` `techsolutions.test`
- Experts: `usman.tariq@`, `sana.riaz@`, `kamran.aziz@`, `nida.farooq@`, `hamza.iqbal@` `techsolutions.test`
  (each has a `specialty` used to filter relevant experts on task assignment)

## 3. Data model (Supabase, all RLS-protected) — see `supabase/schema.sql`
Agency: `profiles` (role: client|expert|admin|intern; +specialty), `experts` (public directory),
`leads`, `contacts`, `orders` (deadline, requirement_link, delivery_link, follow_up, 30/70 invoices),
`tasks` (+expert_tasks VIEW hiding client_budget/profit; RPCs `set_task_status`, `set_task_delivery`;
statuses assigned→in_progress→submitted→revision_requested→under_revision→approved→delivered→completed;
salaried flag, task_number, revision_link), `task_feedback`, `meetings`, `messages` (realtime chat),
`notifications` (realtime + triggers + per-module sidebar badges + sound), `invoices` (phase advance/final,
payment_proof_url), `reviews`, `salaries`, `attachments` (+ Storage buckets `attachments`, `payment-proofs`),
`internship_applications`.
SaaS: `companies`, `company_members` (+ `is_company_member()`, `current_company_id()`),
`saas_clients`, `saas_projects`, `saas_tasks`, `saas_invoices`, `saas_tickets` (all `company_id` + tenant RLS).
Helper `is_admin()` (SECURITY DEFINER) used throughout.

## 4. Key routes
- Public: `/`, `/pricing`, `/internship`, `/subscribe`, `/login` `/register` `/forgot-password` `/reset-password`, `/company-login` `/company-register`
- Agency app: `/app/client/*`, `/app/expert/*` (interns reuse this), `/app/admin/*` (orders, meetings, messages, experts, interns, tasks, invoices, reports, aura)
- SaaS: `/dashboard/*` (clients, projects, tasks, team, invoices, tickets, settings)
- Super-admin: `/admin` (overview, companies, plans)
- API: `/api/ai/chat`

## 5. Done (high level)
Agency Stage 1–3 complete (marketing, auth, orders, tasks+revisions+feedback, meetings, realtime chat,
notifications+sound, invoices 30/70 + Meezan bank details + payment-proof upload, reviews, expert/salary mgmt,
revenue analytics, monthly PDF reports, file uploads via Storage).
SaaS Stage 1–2 + super-admin complete (multi-tenant foundation, company workspace CRUD, super-admin).
AI chatbot + internship program live. SEO (sitemap, robots, OG image, JSON-LD, FAQ). Home redesign
(hero mockup, how-it-works, FAQ, social proof, depth, hover glow). Light/dark theme exists.

## 6. ⏳ IN-PROGRESS / NOT YET DONE (the active TODO batch)
These were requested last and are **not committed**:

**A. UI/visual + cleanup**
1. Remove **Aura AI** from admin nav; rely on **Tech Solutions AI**. Hide the AI floating toggle inside the **SaaS `/dashboard`**.
2. **Moving gradient beneath the hero** (CSS `.animate-gradient-x` was already added to `globals.css`; still need to apply it in the Hero + add a band/glow).
3. **Remove the theme toggle** everywhere (Navbar desktop+mobile, `/app` layout, `SaasShell`, `SuperAdminShell`). `ThemeProvider` can stay (defaults dark).
4. **Remove footer line** "Built with Next.js & Supabase · Deployed on Vercel" (in `src/components/layout/Footer.tsx`).
5. **Start Project → /register** (Hero button + home `onStartProject`).
6. **Remove the Contact page/section**; remove "Contact" from `NAV_LINKS`; the ONLY way to reach the team is **Tech Solutions AI**. (Hero "Book Consultation" should open the AI or go to register — suggest a window event the `TechSolutionsAI` widget listens for.)
7. **Floating note on the AI button** — "Got a query? Get connected" that fades in/out (moving).
8. **Make the dark theme more eye-catching** — richer gradients + **moving background particles** (add a lightweight CSS particle layer, e.g., in the hero).

**B. SaaS commerce (bigger)**
9. **Connect bank account** + generate a **proper invoice when a SaaS plan is chosen** + **payment processing** + **payment screenshot upload** section.
10. **Invoices priced in PKR**, converting the USD plan price at the **real-time** USD→PKR rate (use a free FX API server-side; cache).

**C. Agency project flow (bigger)**
11. **Proposal workflow**: expert/admin submits a **proposal** for a project before it's approved; **client approves** the proposal → project **officially starts**.
12. **Price negotiation** between client and team; **deadline negotiation** by the team.
13. Client can **send a revision** to the admin (partly exists for tasks; extend to the proposal/project level).

## 7. Gotchas / important notes
- **cwd resets to `/Users/app/Downloads/Newportfolio` between turns** — always `cd /Users/app/Downloads/Tech-Solution-New` first.
- A **stale `next` server can squat port 3000** and serve OLD HTML during local testing — `pkill -f next` before `npm start`, and verify on the live URL.
- `supabase/schema.sql` is one big idempotent file; the `expert_tasks` VIEW is defined in 3 places — keep their column lists identical, and add new task columns to the CREATE TABLE (not just ALTER) so fresh runs work.
- **Secrets were pasted in chat → rotate them**: Vercel token, OpenRouter `AI_API_KEY`, Supabase service-role key, DB password.
- AI free tier (OpenRouter) is **rate-limited (429)** intermittently; add credit or a paid model for reliability.
- Billing is **stubbed** (no Stripe account yet) — companies start `trialing`.

## 8. Suggested next-session order
Do batch **A** first (fast, low-risk, all in marketing/layout components), deploy. Then **B** (FX + invoice +
payment proof — mostly new lib + a checkout page), then **C** (proposal/negotiation — new `proposals` table +
statuses + client approve + admin/expert negotiate; ties into orders).
