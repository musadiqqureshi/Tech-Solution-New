-- Tech Solutions Pakistan — Supabase schema (idempotent).
-- Run with: npm run setup:db

-- ── profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null,
  role       text not null default 'client' check (role in ('client','expert','admin')),
  company    text,
  phone      text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ── Helper: is the current user an admin? ────────────────────────────────
-- SECURITY DEFINER so it can read profiles without tripping that table's RLS
-- (avoids infinite recursion in policies that reference profiles).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- ── experts (public directory) ───────────────────────────────────────────
create table if not exists public.experts (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  role                text not null,
  skills              text[] not null default '{}',
  avatar_url          text,
  visible_on_homepage boolean not null default true,
  created_at          timestamptz not null default now()
);
alter table public.experts enable row level security;

drop policy if exists "experts_public_read" on public.experts;
create policy "experts_public_read" on public.experts
  for select using (true);

drop policy if exists "experts_admin_write" on public.experts;
create policy "experts_admin_write" on public.experts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── leads (guided chatbot) ───────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  service     text not null,
  budget      text not null,
  timeline    text not null,
  description text not null,
  name        text not null,
  email       text not null,
  status      text not null default 'new'
              check (status in ('new','contacted','qualified','converted')),
  created_at  timestamptz not null default now()
);
alter table public.leads enable row level security;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert with check (true);

drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select using (public.is_admin());

-- ── contacts ─────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now()
);
alter table public.contacts enable row level security;

drop policy if exists "contacts_public_insert" on public.contacts;
create policy "contacts_public_insert" on public.contacts
  for insert with check (true);

drop policy if exists "contacts_admin_read" on public.contacts;
create policy "contacts_admin_read" on public.contacts
  for select using (public.is_admin());

-- ── orders ───────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id    uuid not null references auth.users(id) on delete cascade,
  client_name  text not null,
  client_email text not null,
  service      text not null,
  title        text not null,
  description  text not null,
  requirements text,
  budget       numeric,
  currency     text check (currency in ('USD','PKR','GBP','EUR','AUD','CAD')),
  status       text not null default 'pending'
               check (status in ('pending','approved','in_progress','delivered','completed','rejected')),
  paid         boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.orders enable row level security;

create index if not exists orders_client_id_idx on public.orders(client_id);
create index if not exists orders_status_idx on public.orders(status);

-- Clients see/manage only their own orders; admins manage everything.
drop policy if exists "orders_client_select" on public.orders;
create policy "orders_client_select" on public.orders
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "orders_client_insert" on public.orders;
create policy "orders_client_insert" on public.orders
  for insert with check (client_id = auth.uid());

drop policy if exists "orders_update_owner_or_admin" on public.orders;
create policy "orders_update_owner_or_admin" on public.orders
  for update using (client_id = auth.uid() or public.is_admin());

drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete using (public.is_admin());

-- ── tasks ────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references public.orders(id) on delete set null,
  title         text not null,
  description   text not null,
  expert_id     uuid not null references auth.users(id) on delete cascade,
  expert_name   text,
  status        text not null default 'assigned'
                check (status in ('assigned','in_progress','submitted','approved','completed')),
  deadline      date,
  expert_budget numeric,
  client_budget numeric,                 -- admin-only (profit source)
  currency      text check (currency in ('USD','PKR','GBP','EUR','AUD','CAD')),
  created_at    timestamptz not null default now()
);
alter table public.tasks enable row level security;

create index if not exists tasks_expert_id_idx on public.tasks(expert_id);
create index if not exists tasks_status_idx on public.tasks(status);

-- Base table: admins only (experts must NOT read client_budget directly).
drop policy if exists "tasks_admin_all" on public.tasks;
create policy "tasks_admin_all" on public.tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- Experts read their tasks through this view, which omits client_budget.
-- (Owned by postgres → bypasses base-table RLS; the WHERE enforces ownership.)
create or replace view public.expert_tasks as
  select id, order_id, title, description, status, deadline,
         expert_budget, currency, created_at, expert_id
  from public.tasks
  where expert_id = auth.uid();
grant select on public.expert_tasks to authenticated;

-- Experts advance their own task status via this guarded RPC only.
create or replace function public.set_task_status(p_task_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('in_progress','submitted') then
    raise exception 'Experts may only set in_progress or submitted';
  end if;
  update public.tasks
     set status = p_status
   where id = p_task_id and expert_id = auth.uid();
  if not found then
    raise exception 'Task not found or not assigned to you';
  end if;
end;
$$;
grant execute on function public.set_task_status(uuid, text) to authenticated;

-- ── invoices ─────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  order_id       uuid references public.orders(id) on delete set null,
  client_id      uuid not null references auth.users(id) on delete cascade,
  client_name    text not null,
  client_email   text not null,
  description    text not null,
  amount         numeric not null,
  currency       text check (currency in ('USD','PKR','GBP','EUR','AUD','CAD')),
  status         text not null default 'unpaid'
                 check (status in ('unpaid','paid','void')),
  issued_date    date not null default current_date,
  due_date       date,
  source         text not null default 'manual' check (source in ('manual','auto')),
  created_at     timestamptz not null default now()
);
alter table public.invoices enable row level security;

create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_status_idx on public.invoices(status);

-- Clients read their own invoices; admins manage everything.
drop policy if exists "invoices_client_select" on public.invoices;
create policy "invoices_client_select" on public.invoices
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "invoices_admin_write" on public.invoices;
create policy "invoices_admin_write" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

-- ── meetings ─────────────────────────────────────────────────────────────
create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references auth.users(id) on delete cascade,
  client_name  text not null,
  client_email text not null,
  topic        text not null,
  notes        text,
  preferred_at timestamptz not null,
  duration_min int not null default 30,
  status       text not null default 'requested'
               check (status in ('requested','confirmed','declined','completed')),
  meeting_link text,
  created_at   timestamptz not null default now()
);
alter table public.meetings enable row level security;
create index if not exists meetings_client_id_idx on public.meetings(client_id);

drop policy if exists "meetings_select_own_or_admin" on public.meetings;
create policy "meetings_select_own_or_admin" on public.meetings
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "meetings_client_insert" on public.meetings;
create policy "meetings_client_insert" on public.meetings
  for insert with check (client_id = auth.uid());

drop policy if exists "meetings_update_own_or_admin" on public.meetings;
create policy "meetings_update_own_or_admin" on public.meetings
  for update using (client_id = auth.uid() or public.is_admin());

drop policy if exists "meetings_admin_delete" on public.meetings;
create policy "meetings_admin_delete" on public.meetings
  for delete using (public.is_admin());

-- ── messages (chat) ──────────────────────────────────────────────────────
-- One conversation per non-admin user (peer_id). from_admin marks the side.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  peer_id     uuid not null references auth.users(id) on delete cascade,
  from_admin  boolean not null default false,
  sender_name text not null,
  body        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.messages enable row level security;
create index if not exists messages_peer_created_idx on public.messages(peer_id, created_at);

drop policy if exists "messages_select_own_or_admin" on public.messages;
create policy "messages_select_own_or_admin" on public.messages
  for select using (peer_id = auth.uid() or public.is_admin());

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    (peer_id = auth.uid() and from_admin = false) or public.is_admin()
  );

drop policy if exists "messages_update_own_or_admin" on public.messages;
create policy "messages_update_own_or_admin" on public.messages
  for update using (peer_id = auth.uid() or public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
