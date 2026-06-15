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
