import { supabase, isSupabaseConfigured } from "./supabase";

export interface InternshipApplication {
  $id?: string;
  name: string;
  email: string;
  phone?: string;
  area: string;
  experience?: string;
  message?: string;
  status?: "new" | "reviewing" | "accepted" | "rejected";
  createdAt?: string;
}

function rowTo(r: Record<string, unknown>): InternshipApplication {
  return {
    $id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    phone: (r.phone as string) ?? undefined,
    area: r.area as string,
    experience: (r.experience as string) ?? undefined,
    message: (r.message as string) ?? undefined,
    status: r.status as InternshipApplication["status"],
    createdAt: r.created_at as string,
  };
}

export async function submitApplication(a: Omit<InternshipApplication, "$id" | "status" | "createdAt">): Promise<void> {
  if (!isSupabaseConfigured) { console.info("[dev] internship application:", a); return; }
  const { error } = await supabase.from("internship_applications").insert({
    name: a.name, email: a.email, phone: a.phone ?? null, area: a.area,
    experience: a.experience ?? null, message: a.message ?? null,
  });
  if (error) throw error;
}

export async function listApplications(): Promise<InternshipApplication[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("internship_applications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowTo);
}

export async function setApplicationStatus(id: string, status: NonNullable<InternshipApplication["status"]>): Promise<InternshipApplication> {
  const { data, error } = await supabase.from("internship_applications").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return rowTo(data);
}

export const INTERN_AREAS = [
  "Software Development", "Web Development", "Mobile Applications",
  "AI / Machine Learning", "UI/UX Design", "Content & Research Writing",
];
