import { supabase, isSupabaseConfigured } from "./supabase";
import type { AppNotification } from "./types";

function rowToNotif(r: Record<string, unknown>): AppNotification {
  return {
    $id: r.id as string,
    userId: r.user_id as string,
    type: r.type as string,
    title: r.title as string,
    body: (r.body as string) ?? undefined,
    link: (r.link as string) ?? undefined,
    read: Boolean(r.read),
    createdAt: r.created_at as string,
  };
}

/** The current user's recent notifications (RLS scopes to them). */
export async function listMyNotifications(): Promise<AppNotification[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(rowToNotif);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("notifications").update({ read: true }).eq("read", false);
}

/** Realtime: new notifications for this user. Returns an unsubscribe fn. */
export function subscribeNotifications(
  userId: string,
  onInsert: (n: AppNotification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(rowToNotif(payload.new as Record<string, unknown>))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
