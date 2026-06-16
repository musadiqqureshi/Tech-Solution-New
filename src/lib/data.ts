import { supabase, isSupabaseConfigured } from "./supabase";
import type { LeadRequest, ContactMessage, Expert } from "./types";
import { FALLBACK_EXPERTS } from "./constants";

/** Persist a guided-chatbot lead. Falls back to a no-op success in dev. */
export async function submitLead(lead: LeadRequest): Promise<void> {
  if (!isSupabaseConfigured) {
    console.info("[dev] Lead captured (Supabase not configured):", lead);
    return;
  }
  const { error } = await supabase.from("leads").insert({ ...lead, status: "new" });
  if (error) throw error;
}

/** Persist a contact-form message. */
export async function submitContact(msg: ContactMessage): Promise<void> {
  if (!isSupabaseConfigured) {
    console.info("[dev] Contact captured (Supabase not configured):", msg);
    return;
  }
  const { error } = await supabase.from("contacts").insert(msg);
  if (error) throw error;
}

/** Map a Supabase experts row to the Expert shape used by the UI. */
function rowToExpert(r: Record<string, unknown>): Expert {
  return {
    $id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    skills: (r.skills as string[]) ?? [],
    avatarUrl: (r.avatar_url as string) ?? undefined,
    visibleOnHomepage: (r.visible_on_homepage as boolean) ?? true,
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company?: string;
  phone?: string;
}

/** Load the signed-in user's profile row. */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("name, email, role, company, phone")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserProfile) ?? null;
}

/** Update editable profile fields (name, company, phone). */
export async function updateProfile(
  userId: string,
  fields: { name?: string; company?: string; phone?: string }
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      company: fields.company ?? null,
      phone: fields.phone ?? null,
    })
    .eq("id", userId);
  if (error) throw error;
}

/** Admin: every expert in the directory (visible or not). */
export async function listAllExperts(): Promise<Expert[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("experts")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(rowToExpert);
}

export interface ExpertInput {
  name: string;
  role: string;
  skills: string[];
  avatarUrl?: string;
  visibleOnHomepage?: boolean;
}

export async function createExpert(input: ExpertInput): Promise<Expert> {
  const { data, error } = await supabase
    .from("experts")
    .insert({
      name: input.name,
      role: input.role,
      skills: input.skills,
      avatar_url: input.avatarUrl ?? null,
      visible_on_homepage: input.visibleOnHomepage ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToExpert(data);
}

export async function updateExpert(id: string, input: ExpertInput): Promise<Expert> {
  const { data, error } = await supabase
    .from("experts")
    .update({
      name: input.name,
      role: input.role,
      skills: input.skills,
      avatar_url: input.avatarUrl ?? null,
      visible_on_homepage: input.visibleOnHomepage ?? true,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToExpert(data);
}

export async function setExpertVisible(id: string, visible: boolean): Promise<Expert> {
  const { data, error } = await supabase
    .from("experts")
    .update({ visible_on_homepage: visible })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToExpert(data);
}

export async function deleteExpert(id: string): Promise<void> {
  const { error } = await supabase.from("experts").delete().eq("id", id);
  if (error) throw error;
}

/** Load experts flagged as visible on the homepage; fall back to seed data. */
export async function getHomepageExperts(): Promise<Expert[]> {
  if (!isSupabaseConfigured) return FALLBACK_EXPERTS as Expert[];
  try {
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .eq("visible_on_homepage", true)
      .limit(12);
    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_EXPERTS as Expert[];
    return data.map(rowToExpert);
  } catch (e) {
    console.warn("Failed to load experts, using fallback:", e);
    return FALLBACK_EXPERTS as Expert[];
  }
}
