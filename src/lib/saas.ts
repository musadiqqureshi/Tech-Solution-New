import { supabase, isSupabaseConfigured } from "./supabase";

export type CompanyPlan = "starter" | "professional" | "enterprise";
export type CompanyStatus = "trialing" | "active" | "suspended" | "cancelled" | "pending";

export interface Company {
  id: string;
  name: string;
  slug?: string;
  ownerId: string;
  plan: CompanyPlan;
  status: CompanyStatus;
  createdAt?: string;
}

export const PLAN_LABEL: Record<CompanyPlan, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

function rowToCompany(r: Record<string, unknown>): Company {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: (r.slug as string) ?? undefined,
    ownerId: r.owner_id as string,
    plan: r.plan as CompanyPlan,
    status: r.status as CompanyStatus,
    createdAt: r.created_at as string,
  };
}

/** The company the signed-in user belongs to (RLS returns only theirs). */
export async function getMyCompany(): Promise<Company | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw error;
  return data && data.length ? rowToCompany(data[0]) : null;
}

export async function registerCompany(input: {
  name: string;
  plan: CompanyPlan;
  userId: string;
  userName: string;
  userEmail: string;
}): Promise<Company> {
  const slug =
    input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      slug,
      owner_id: input.userId,
      plan: input.plan,
      status: "trialing",
    })
    .select()
    .single();
  if (error) throw error;
  const { error: mErr } = await supabase.from("company_members").insert({
    company_id: data.id,
    user_id: input.userId,
    role: "owner",
    name: input.userName,
    email: input.userEmail,
  });
  if (mErr) throw mErr;
  return rowToCompany(data);
}

export async function updateCompany(
  id: string,
  fields: { name?: string; plan?: CompanyPlan }
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToCompany(data);
}

// ── Stage 2: tenant CRUD ───────────────────────────────────────────────────
export interface SaasClient { id?: string; companyId: string; name: string; email?: string; companyName?: string; phone?: string; createdAt?: string; }
export interface SaasProject { id?: string; companyId: string; clientId?: string; name: string; description?: string; status: string; deadline?: string; budget?: number; currency?: string; createdAt?: string; }
export interface SaasTask { id?: string; companyId: string; projectId?: string; title: string; description?: string; assigneeId?: string; status: string; deadline?: string; createdAt?: string; }
export interface SaasInvoice { id?: string; companyId: string; clientId?: string; number?: string; amount: number; currency?: string; status: string; dueDate?: string; createdAt?: string; }
export interface SaasTicket { id?: string; companyId: string; clientId?: string; subject: string; body?: string; status: string; priority: string; createdAt?: string; }
export interface CompanyMember { companyId: string; userId: string; role: string; name?: string; email?: string; createdAt?: string; }

const camel = <T,>(r: Record<string, unknown>): T => {
  const o: Record<string, unknown> = {};
  for (const k in r) o[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = r[k];
  o.id = r.id; o.companyId = r.company_id; o.clientId = r.client_id; o.projectId = r.project_id;
  o.assigneeId = r.assignee_id; o.dueDate = r.due_date; o.companyName = r.company_name;
  o.createdAt = r.created_at;
  return o as T;
};

async function list<T>(table: string, companyId: string): Promise<T[]> {
  if (!isSupabaseConfigured || !companyId) return [];
  const { data, error } = await supabase.from(table).select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => camel<T>(r));
}
async function insert<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return camel<T>(data);
}
async function update<T>(table: string, id: string, row: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).update(row).eq("id", id).select().single();
  if (error) throw error;
  return camel<T>(data);
}
async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

// Clients
export const listClients = (c: string) => list<SaasClient>("saas_clients", c);
export const createClientRec = (c: string, i: { name: string; email?: string; companyName?: string; phone?: string }) =>
  insert<SaasClient>("saas_clients", { company_id: c, name: i.name, email: i.email ?? null, company_name: i.companyName ?? null, phone: i.phone ?? null });
export const updateClientRec = (id: string, i: { name: string; email?: string; companyName?: string; phone?: string }) =>
  update<SaasClient>("saas_clients", id, { name: i.name, email: i.email ?? null, company_name: i.companyName ?? null, phone: i.phone ?? null });
export const deleteClientRec = (id: string) => remove("saas_clients", id);

// Projects
export const listProjects = (c: string) => list<SaasProject>("saas_projects", c);
export const createProject = (c: string, i: { name: string; clientId?: string; description?: string; status?: string; deadline?: string; budget?: number; currency?: string }) =>
  insert<SaasProject>("saas_projects", { company_id: c, name: i.name, client_id: i.clientId ?? null, description: i.description ?? null, status: i.status ?? "active", deadline: i.deadline ?? null, budget: i.budget ?? null, currency: i.currency ?? null });
export const updateProject = (id: string, i: Partial<{ name: string; clientId: string; description: string; status: string; deadline: string; budget: number; currency: string }>) =>
  update<SaasProject>("saas_projects", id, { ...(i.name !== undefined ? { name: i.name } : {}), ...(i.clientId !== undefined ? { client_id: i.clientId || null } : {}), ...(i.description !== undefined ? { description: i.description } : {}), ...(i.status !== undefined ? { status: i.status } : {}), ...(i.deadline !== undefined ? { deadline: i.deadline || null } : {}), ...(i.budget !== undefined ? { budget: i.budget } : {}), ...(i.currency !== undefined ? { currency: i.currency } : {}) });
export const deleteProject = (id: string) => remove("saas_projects", id);

// Tasks
export const listSaasTasks = (c: string) => list<SaasTask>("saas_tasks", c);
export const createSaasTask = (c: string, i: { title: string; projectId?: string; description?: string; assigneeId?: string; status?: string; deadline?: string }) =>
  insert<SaasTask>("saas_tasks", { company_id: c, title: i.title, project_id: i.projectId ?? null, description: i.description ?? null, assignee_id: i.assigneeId ?? null, status: i.status ?? "todo", deadline: i.deadline ?? null });
export const updateSaasTask = (id: string, i: Partial<{ title: string; projectId: string; description: string; assigneeId: string; status: string; deadline: string }>) =>
  update<SaasTask>("saas_tasks", id, { ...(i.title !== undefined ? { title: i.title } : {}), ...(i.projectId !== undefined ? { project_id: i.projectId || null } : {}), ...(i.description !== undefined ? { description: i.description } : {}), ...(i.assigneeId !== undefined ? { assignee_id: i.assigneeId || null } : {}), ...(i.status !== undefined ? { status: i.status } : {}), ...(i.deadline !== undefined ? { deadline: i.deadline || null } : {}) });
export const deleteSaasTask = (id: string) => remove("saas_tasks", id);

// Invoices
export const listSaasInvoices = (c: string) => list<SaasInvoice>("saas_invoices", c);
export const createSaasInvoice = (c: string, i: { clientId?: string; number?: string; amount: number; currency?: string; dueDate?: string }) =>
  insert<SaasInvoice>("saas_invoices", { company_id: c, client_id: i.clientId ?? null, number: i.number ?? null, amount: i.amount, currency: i.currency ?? null, due_date: i.dueDate ?? null, status: "unpaid" });
export const updateSaasInvoice = (id: string, i: { status: string }) => update<SaasInvoice>("saas_invoices", id, { status: i.status });
export const deleteSaasInvoice = (id: string) => remove("saas_invoices", id);

// Tickets
export const listSaasTickets = (c: string) => list<SaasTicket>("saas_tickets", c);
export const createSaasTicket = (c: string, i: { subject: string; body?: string; clientId?: string; priority?: string }) =>
  insert<SaasTicket>("saas_tickets", { company_id: c, subject: i.subject, body: i.body ?? null, client_id: i.clientId ?? null, priority: i.priority ?? "normal", status: "open" });
export const updateSaasTicket = (id: string, i: { status: string }) => update<SaasTicket>("saas_tickets", id, { status: i.status });
export const deleteSaasTicket = (id: string) => remove("saas_tickets", id);

// Team
export async function listMembers(companyId: string): Promise<CompanyMember[]> {
  if (!isSupabaseConfigured || !companyId) return [];
  const { data, error } = await supabase.from("company_members").select("*").eq("company_id", companyId).order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => camel<CompanyMember>(r));
}

// ── Super-admin (Tech Solutions platform) ─────────────────────────────────
export async function listAllCompanies(): Promise<Company[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToCompany);
}

export async function adminUpdateCompany(
  id: string,
  fields: { plan?: CompanyPlan; status?: CompanyStatus }
): Promise<Company> {
  const { data, error } = await supabase.from("companies").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return rowToCompany(data);
}

/** All company_members across the platform (admin only) — for seat analytics. */
export async function listAllMembers(): Promise<CompanyMember[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("company_members").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => camel<CompanyMember>(r));
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}
