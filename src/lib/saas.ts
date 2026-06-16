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
