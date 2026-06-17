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
  delivery_link text,
  task_number   text,
  requirements  text,
  requirement_link text,
  delivery_notes text,
  revision_count int not null default 0,
  revision_link text,
  salaried      boolean not null default false,
  created_at    timestamptz not null default now()
);
alter table public.tasks enable row level security;

-- Ensure new columns exist on pre-existing tables (idempotent, before views).
alter table public.tasks add column if not exists delivery_link text;
alter table public.tasks add column if not exists task_number text;
alter table public.tasks add column if not exists requirements text;
alter table public.tasks add column if not exists requirement_link text;
alter table public.tasks add column if not exists delivery_notes text;
alter table public.tasks add column if not exists revision_count int not null default 0;
alter table public.tasks add column if not exists revision_link text;
alter table public.tasks add column if not exists salaried boolean not null default false;
alter table public.profiles add column if not exists specialty text;

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
         expert_budget, currency, created_at, expert_id, delivery_link, task_number,
         requirements, requirement_link, delivery_notes, revision_count, revision_link, salaried
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

-- ── Stage 3: delivery + follow-up links ──────────────────────────────────
alter table public.orders add column if not exists delivery_link text;
alter table public.orders add column if not exists follow_up text;
alter table public.orders add column if not exists follow_up_at timestamptz;
alter table public.tasks  add column if not exists delivery_link text;

-- Refresh the expert view to expose the delivery link (added at the end).
create or replace view public.expert_tasks as
  select id, order_id, title, description, status, deadline,
         expert_budget, currency, created_at, expert_id, delivery_link, task_number,
         requirements, requirement_link, delivery_notes, revision_count, revision_link, salaried
  from public.tasks
  where expert_id = auth.uid();
grant select on public.expert_tasks to authenticated;

-- Experts attach their final delivery link to their own task.
create or replace function public.set_task_delivery(p_task_id uuid, p_link text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
     set delivery_link = p_link
   where id = p_task_id and expert_id = auth.uid();
  if not found then
    raise exception 'Task not found or not assigned to you';
  end if;
end;
$$;
grant execute on function public.set_task_delivery(uuid, text) to authenticated;

-- ── Stage 3: invoice phase (30% advance / 70% final) ─────────────────────
alter table public.invoices add column if not exists phase text not null default 'full'
  check (phase in ('advance','final','full'));

-- ── reviews ──────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references public.orders(id) on delete cascade,
  client_id   uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.reviews enable row level security;

drop policy if exists "reviews_read" on public.reviews;
create policy "reviews_read" on public.reviews
  for select using (approved or client_id = auth.uid() or public.is_admin());

drop policy if exists "reviews_client_insert" on public.reviews;
create policy "reviews_client_insert" on public.reviews
  for insert with check (client_id = auth.uid());

drop policy if exists "reviews_admin_write" on public.reviews;
create policy "reviews_admin_write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ── notifications ────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create index if not exists notifications_user_idx on public.notifications(user_id, created_at);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_insert_any" on public.notifications;
create policy "notifications_insert_any" on public.notifications
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ── Auto-notification triggers ───────────────────────────────────────────
create or replace function public.notify_admins(p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id, type, title, body, link)
  select id, p_type, p_title, p_body, p_link from public.profiles where role = 'admin';
$$;

-- messages
create or replace function public.on_message_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.from_admin then
    insert into public.notifications(user_id,type,title,body,link)
    values (NEW.peer_id,'message','New message from support',left(NEW.body,120),'/app');
  else
    perform public.notify_admins('message','New message from '||NEW.sender_name,left(NEW.body,120),'/app/admin/messages');
  end if;
  return NEW;
end $$;
drop trigger if exists trg_message_notify on public.messages;
create trigger trg_message_notify after insert on public.messages
  for each row execute function public.on_message_insert();

-- tasks (assignment)
create or replace function public.on_task_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id,type,title,body,link)
  values (NEW.expert_id,'task','New task assigned',NEW.title,'/app/expert/tasks');
  return NEW;
end $$;
drop trigger if exists trg_task_notify on public.tasks;
create trigger trg_task_notify after insert on public.tasks
  for each row execute function public.on_task_insert();

-- meetings (request + status change)
create or replace function public.on_meeting_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public.notify_admins('meeting','New meeting request',NEW.topic,'/app/admin/meetings');
  elsif NEW.status is distinct from OLD.status then
    insert into public.notifications(user_id,type,title,body,link)
    values (NEW.client_id,'meeting','Meeting '||NEW.status,NEW.topic,'/app/client/meetings');
  end if;
  return NEW;
end $$;
drop trigger if exists trg_meeting_notify on public.meetings;
create trigger trg_meeting_notify after insert or update on public.meetings
  for each row execute function public.on_meeting_change();

-- orders (new + status / delivery change)
create or replace function public.on_order_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public.notify_admins('order','New order '||NEW.order_number,NEW.title,'/app/admin/orders');
  else
    if NEW.status is distinct from OLD.status then
      insert into public.notifications(user_id,type,title,body,link)
      values (NEW.client_id,'order','Order '||NEW.status,NEW.title,'/app/client/orders');
    end if;
    if NEW.delivery_link is distinct from OLD.delivery_link and NEW.delivery_link is not null then
      insert into public.notifications(user_id,type,title,body,link)
      values (NEW.client_id,'order','Your delivery is ready',NEW.title,'/app/client/orders');
    end if;
    if NEW.follow_up is distinct from OLD.follow_up and NEW.follow_up is not null then
      perform public.notify_admins('order','Follow-up requested',NEW.title,'/app/admin/orders');
    end if;
  end if;
  return NEW;
end $$;
drop trigger if exists trg_order_notify on public.orders;
create trigger trg_order_notify after insert or update on public.orders
  for each row execute function public.on_order_change();

-- ── Refinements: deadlines, requirement links, task serial, submit notify ──
alter table public.orders add column if not exists deadline date;
alter table public.orders add column if not exists requirement_link text;
alter table public.tasks  add column if not exists task_number text;

-- expose task_number + delivery_link to experts
create or replace view public.expert_tasks as
  select id, order_id, title, description, status, deadline,
         expert_budget, currency, created_at, expert_id, delivery_link, task_number,
         requirements, requirement_link, delivery_notes, revision_count, revision_link, salaried
  from public.tasks
  where expert_id = auth.uid();
grant select on public.expert_tasks to authenticated;

-- Notify admins when an expert submits or attaches a delivery on their task.
create or replace function public.on_task_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.status = 'submitted' and OLD.status is distinct from 'submitted' then
    perform public.notify_admins('task','Expert submitted a final delivery — please review',
      coalesce(NEW.task_number||' · ','')||NEW.title, '/app/admin/tasks');
  end if;
  if NEW.delivery_link is distinct from OLD.delivery_link and NEW.delivery_link is not null then
    perform public.notify_admins('task','Expert attached a delivery link', NEW.title, '/app/admin/tasks');
  end if;
  return NEW;
end $$;
drop trigger if exists trg_task_update_notify on public.tasks;
create trigger trg_task_update_notify after update on public.tasks
  for each row execute function public.on_task_update();

-- ── Payment proof upload ─────────────────────────────────────────────────
alter table public.invoices add column if not exists payment_proof_url text;
alter table public.invoices add column if not exists payment_submitted_at timestamptz;

-- Public storage bucket for payment screenshots.
insert into storage.buckets (id, name, public)
  values ('payment-proofs', 'payment-proofs', true)
  on conflict (id) do nothing;

drop policy if exists "payment_proofs_insert" on storage.objects;
create policy "payment_proofs_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'payment-proofs');

drop policy if exists "payment_proofs_read" on storage.objects;
create policy "payment_proofs_read" on storage.objects
  for select using (bucket_id = 'payment-proofs');

-- Client submits proof for their own invoice; admins get notified.
create or replace function public.submit_payment_proof(p_invoice_id uuid, p_url text)
returns void language plpgsql security definer set search_path = public as $$
declare v_client uuid; v_name text; v_num text;
begin
  select client_id, client_name, invoice_number into v_client, v_name, v_num
  from public.invoices where id = p_invoice_id;
  if v_client is null or v_client <> auth.uid() then
    raise exception 'Not your invoice';
  end if;
  update public.invoices
     set payment_proof_url = p_url, payment_submitted_at = now()
   where id = p_invoice_id;
  perform public.notify_admins('invoice','Client uploaded a payment proof',
    v_name || ' paid invoice ' || v_num, '/app/admin/invoices');
end $$;
grant execute on function public.submit_payment_proof(uuid, text) to authenticated;

-- ── Task workflow overhaul: statuses, fields, feedback ────────────────────
alter table public.tasks add column if not exists requirements text;
alter table public.tasks add column if not exists requirement_link text;
alter table public.tasks add column if not exists delivery_notes text;
alter table public.tasks add column if not exists revision_count int not null default 0;

-- Expanded status set.
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('assigned','in_progress','submitted','revision_requested',
                    'under_revision','approved','delivered','completed'));

-- Helper: does the caller own this task? (definer → safe in RLS)
create or replace function public.owns_task(p_task_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tasks where id = p_task_id and expert_id = auth.uid());
$$;

-- Per-task feedback / communication thread.
create table if not exists public.task_feedback (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_role text not null check (author_role in ('admin','expert')),
  kind        text not null default 'message'
              check (kind in ('message','revision','follow_up','response')),
  body        text not null,
  created_at  timestamptz not null default now()
);
alter table public.task_feedback enable row level security;
create index if not exists task_feedback_task_idx on public.task_feedback(task_id, created_at);

drop policy if exists "task_feedback_select" on public.task_feedback;
create policy "task_feedback_select" on public.task_feedback
  for select using (public.is_admin() or public.owns_task(task_id));

drop policy if exists "task_feedback_insert" on public.task_feedback;
create policy "task_feedback_insert" on public.task_feedback
  for insert with check (
    author_id = auth.uid() and (public.is_admin() or public.owns_task(task_id))
  );

do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='task_feedback') then
    alter publication supabase_realtime add table public.task_feedback;
  end if;
end $$;

-- Expert resubmission allowed via guarded RPC.
create or replace function public.set_task_status(p_task_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('in_progress','submitted','under_revision') then
    raise exception 'Experts may only set in_progress, submitted, or under_revision';
  end if;
  update public.tasks set status = p_status
   where id = p_task_id and expert_id = auth.uid();
  if not found then raise exception 'Task not found or not assigned to you'; end if;
end $$;
grant execute on function public.set_task_status(uuid, text) to authenticated;

-- Extend task update notifications (submit / revision / approved / delivered).
create or replace function public.on_task_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.status is distinct from OLD.status then
    if NEW.status = 'submitted' then
      perform public.notify_admins('task','Expert submitted a final delivery — please review',
        coalesce(NEW.task_number||' · ','')||NEW.title, '/app/admin/tasks/'||NEW.id);
    elsif NEW.status = 'revision_requested' then
      insert into public.notifications(user_id,type,title,body,link)
      values (NEW.expert_id,'task','Revision requested',NEW.title,'/app/expert/tasks');
    elsif NEW.status = 'approved' then
      insert into public.notifications(user_id,type,title,body,link)
      values (NEW.expert_id,'task','Your task was approved',NEW.title,'/app/expert/tasks');
    elsif NEW.status = 'delivered' then
      insert into public.notifications(user_id,type,title,body,link)
      values (NEW.expert_id,'task','Task delivered to client',NEW.title,'/app/expert/tasks');
    end if;
  end if;
  if NEW.delivery_link is distinct from OLD.delivery_link and NEW.delivery_link is not null then
    perform public.notify_admins('task','Expert attached a delivery link', NEW.title, '/app/admin/tasks/'||NEW.id);
  end if;
  return NEW;
end $$;

-- Notify the other party when feedback is posted.
create or replace function public.on_feedback_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_expert uuid; v_title text;
begin
  select expert_id, title into v_expert, v_title from public.tasks where id = NEW.task_id;
  if NEW.author_role = 'admin' then
    insert into public.notifications(user_id,type,title,body,link)
    values (v_expert,'task',
      case NEW.kind when 'follow_up' then 'Follow-up request' when 'revision' then 'Revision feedback' else 'New feedback on your task' end,
      v_title, '/app/expert/tasks');
  else
    perform public.notify_admins('task','Expert replied on a task', v_title, '/app/admin/tasks');
  end if;
  return NEW;
end $$;
drop trigger if exists trg_feedback_notify on public.task_feedback;
create trigger trg_feedback_notify after insert on public.task_feedback
  for each row execute function public.on_feedback_insert();

-- ── File attachments (Supabase Storage) ──────────────────────────────────
create or replace function public.owns_order(p_order_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders where id = p_order_id and client_id = auth.uid());
$$;

create table if not exists public.attachments (
  id          uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('order','task')),
  entity_id   uuid not null,
  kind        text not null default 'general'
              check (kind in ('requirement','delivery','revision','general')),
  name        text not null,
  url         text not null,
  path        text not null,
  size        bigint,
  created_at  timestamptz not null default now()
);
alter table public.attachments enable row level security;
create index if not exists attachments_entity_idx on public.attachments(entity_type, entity_id);

-- Visibility: admins all; order files to that order's client; task files to the
-- assigned expert. (Uploaders are covered by the owns_* / is_admin checks too.)
drop policy if exists "attachments_select" on public.attachments;
create policy "attachments_select" on public.attachments
  for select using (
    public.is_admin()
    or (entity_type = 'order' and public.owns_order(entity_id))
    or (entity_type = 'task' and public.owns_task(entity_id))
  );

drop policy if exists "attachments_insert" on public.attachments;
create policy "attachments_insert" on public.attachments
  for insert with check (
    uploaded_by = auth.uid() and (
      public.is_admin()
      or (entity_type = 'order' and public.owns_order(entity_id))
      or (entity_type = 'task' and public.owns_task(entity_id))
    )
  );

drop policy if exists "attachments_delete" on public.attachments;
create policy "attachments_delete" on public.attachments
  for delete using (uploaded_by = auth.uid() or public.is_admin());

-- Public storage bucket for attachments (paths carry UUIDs).
insert into storage.buckets (id, name, public)
  values ('attachments', 'attachments', true)
  on conflict (id) do nothing;

drop policy if exists "attachments_storage_insert" on storage.objects;
create policy "attachments_storage_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'attachments');

drop policy if exists "attachments_storage_read" on storage.objects;
create policy "attachments_storage_read" on storage.objects
  for select using (bucket_id = 'attachments');

drop policy if exists "attachments_storage_delete" on storage.objects;
create policy "attachments_storage_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'attachments');

-- ── salaries (admin payroll for salaried experts) ─────────────────────────
create table if not exists public.salaries (
  id          uuid primary key default gen_random_uuid(),
  expert_id   uuid not null references auth.users(id) on delete cascade,
  expert_name text not null,
  amount      numeric not null,
  currency    text check (currency in ('USD','PKR','GBP','EUR','AUD','CAD')),
  period      text not null,                 -- e.g. "2026-06"
  paid        boolean not null default false,
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.salaries enable row level security;
create index if not exists salaries_expert_idx on public.salaries(expert_id);

drop policy if exists "salaries_admin_all" on public.salaries;
create policy "salaries_admin_all" on public.salaries
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "salaries_expert_select" on public.salaries;
create policy "salaries_expert_select" on public.salaries
  for select using (expert_id = auth.uid() or public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- SaaS multi-tenant platform (separate from the agency portals above)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  plan       text not null default 'starter' check (plan in ('starter','professional','enterprise')),
  status     text not null default 'trialing'
             check (status in ('trialing','active','suspended','cancelled','pending')),
  created_at timestamptz not null default now()
);
alter table public.companies enable row level security;

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner','admin','member')),
  name       text,
  email      text,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
alter table public.company_members enable row level security;

-- Tenant helpers (SECURITY DEFINER → no RLS recursion).
create or replace function public.is_company_member(p_company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.company_members
                 where company_id = p_company and user_id = auth.uid());
$$;

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.company_members
   where user_id = auth.uid() order by created_at limit 1;
$$;

-- companies RLS
drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies
  for select using (owner_id = auth.uid() or public.is_company_member(id) or public.is_admin());
drop policy if exists "companies_insert" on public.companies;
create policy "companies_insert" on public.companies
  for insert with check (owner_id = auth.uid());
drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies
  for update using (owner_id = auth.uid() or public.is_admin());
drop policy if exists "companies_delete" on public.companies;
create policy "companies_delete" on public.companies
  for delete using (owner_id = auth.uid() or public.is_admin());

-- company_members RLS
drop policy if exists "members_select" on public.company_members;
create policy "members_select" on public.company_members
  for select using (user_id = auth.uid() or public.is_company_member(company_id) or public.is_admin());
drop policy if exists "members_insert" on public.company_members;
create policy "members_insert" on public.company_members
  for insert with check (user_id = auth.uid() or public.is_company_member(company_id));
drop policy if exists "members_delete" on public.company_members;
create policy "members_delete" on public.company_members
  for delete using (public.is_company_member(company_id));

-- Tenant data tables: every row carries company_id; RLS isolates by membership.
create table if not exists public.saas_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null, email text, company_name text, phone text,
  created_at timestamptz not null default now()
);
create table if not exists public.saas_projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid references public.saas_clients(id) on delete set null,
  name text not null, description text,
  status text not null default 'active' check (status in ('active','on_hold','completed','cancelled')),
  deadline date, budget numeric, currency text,
  created_at timestamptz not null default now()
);
create table if not exists public.saas_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.saas_projects(id) on delete cascade,
  title text not null, description text, assignee_id uuid,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  deadline date, created_at timestamptz not null default now()
);
create table if not exists public.saas_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid references public.saas_clients(id) on delete set null,
  number text, amount numeric not null, currency text,
  status text not null default 'unpaid' check (status in ('unpaid','paid','void')),
  due_date date, created_at timestamptz not null default now()
);
create table if not exists public.saas_tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid references public.saas_clients(id) on delete set null,
  subject text not null, body text,
  status text not null default 'open' check (status in ('open','pending','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['saas_clients','saas_projects','saas_tasks','saas_invoices','saas_tickets'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_tenant" on public.%I', t, t);
    execute format(
      'create policy "%s_tenant" on public.%I for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id))',
      t, t);
    execute format('create index if not exists %s_company_idx on public.%I(company_id)', t, t);
  end loop;
end $$;
