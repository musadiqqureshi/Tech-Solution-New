import { supabase, isSupabaseConfigured } from "./supabase";
import type { Salary, Currency } from "./types";

function rowToSalary(r: Record<string, unknown>): Salary {
  return {
    $id: r.id as string,
    expertId: r.expert_id as string,
    expertName: r.expert_name as string,
    amount: Number(r.amount),
    currency: (r.currency as Currency) ?? undefined,
    period: r.period as string,
    paid: Boolean(r.paid),
    note: (r.note as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

export async function listSalaries(): Promise<Salary[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("salaries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToSalary);
}

export async function addSalary(input: {
  expertId: string;
  expertName: string;
  amount: number;
  currency?: Currency;
  period: string;
  note?: string;
}): Promise<Salary> {
  const { data, error } = await supabase
    .from("salaries")
    .insert({
      expert_id: input.expertId,
      expert_name: input.expertName,
      amount: input.amount,
      currency: input.currency ?? null,
      period: input.period,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToSalary(data);
}

export async function setSalaryPaid(id: string, paid: boolean): Promise<Salary> {
  const { data, error } = await supabase
    .from("salaries")
    .update({ paid })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToSalary(data);
}

export async function deleteSalary(id: string): Promise<void> {
  const { error } = await supabase.from("salaries").delete().eq("id", id);
  if (error) throw error;
}
