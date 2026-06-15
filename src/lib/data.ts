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
