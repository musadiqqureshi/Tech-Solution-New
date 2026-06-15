import { supabase, isSupabaseConfigured } from "./supabase";
import type { ChatMessage } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

function rowToMessage(r: Record<string, unknown>): ChatMessage {
  return {
    $id: r.id as string,
    peerId: r.peer_id as string,
    fromAdmin: Boolean(r.from_admin),
    senderName: r.sender_name as string,
    body: r.body as string,
    read: Boolean(r.read),
    createdAt: r.created_at as string,
  };
}

/** Messages in one conversation (a non-admin user's thread), oldest first. */
export async function listMessages(peerId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("peer_id", peerId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map(rowToMessage);
}

export async function sendMessage(input: {
  peerId: string;
  body: string;
  fromAdmin: boolean;
  senderName: string;
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      peer_id: input.peerId,
      body: input.body,
      from_admin: input.fromAdmin,
      sender_name: input.senderName,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMessage(data);
}

/** Mark the other side's messages as read in this conversation. */
export async function markRead(peerId: string, viewerIsAdmin: boolean): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("peer_id", peerId)
    .eq("from_admin", !viewerIsAdmin) // admin reads client msgs; client reads admin msgs
    .eq("read", false);
}

export interface Conversation {
  peerId: string;
  peerName: string;
  lastBody: string;
  lastAt: string;
  unread: number;
}

/** Admin: all conversations, newest activity first, with unread counts. */
export async function listConversations(): Promise<Conversation[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  const map = new Map<string, Conversation>();
  for (const row of data ?? []) {
    const m = rowToMessage(row);
    let c = map.get(m.peerId);
    if (!c) {
      c = { peerId: m.peerId, peerName: "", lastBody: m.body, lastAt: m.createdAt, unread: 0 };
      map.set(m.peerId, c);
    }
    if (!c.peerName && !m.fromAdmin) c.peerName = m.senderName;
    if (!m.fromAdmin && !m.read) c.unread += 1;
  }
  return Array.from(map.values());
}

/**
 * Subscribe to inserts AND updates (read receipts) in a conversation.
 * The callback fires with each changed message; upsert it by id. Returns
 * an unsubscribe fn.
 */
export function subscribeMessages(
  peerId: string,
  onChange: (m: ChatMessage) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`messages:${peerId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `peer_id=eq.${peerId}` },
      (payload) => onChange(rowToMessage(payload.new as Record<string, unknown>))
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages", filter: `peer_id=eq.${peerId}` },
      (payload) => onChange(rowToMessage(payload.new as Record<string, unknown>))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export interface PresenceHandle {
  channel: RealtimeChannel;
  setTyping: (typing: boolean) => void;
  cleanup: () => void;
}

/**
 * Presence + typing channel for a conversation.
 * onState(otherOnline, otherTyping) fires as the other side's status changes.
 */
export function joinPresence(
  peerId: string,
  me: { id: string; isAdmin: boolean },
  onState: (otherOnline: boolean, otherTyping: boolean) => void
): PresenceHandle {
  const myKey = me.isAdmin ? "admin" : "peer";
  const otherKey = me.isAdmin ? "peer" : "admin";
  let typing = false;

  const channel = supabase.channel(`presence:${peerId}`, {
    config: { presence: { key: myKey } },
  });

  const emit = () => {
    const state = channel.presenceState() as Record<string, Array<{ typing?: boolean }>>;
    const other = state[otherKey];
    onState(Boolean(other && other.length > 0), Boolean(other?.[0]?.typing));
  };

  channel
    .on("presence", { event: "sync" }, emit)
    .on("presence", { event: "join" }, emit)
    .on("presence", { event: "leave" }, emit)
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track({ typing: false });
    });

  return {
    channel,
    setTyping: (t: boolean) => {
      if (t === typing) return;
      typing = t;
      channel.track({ typing: t });
    },
    cleanup: () => {
      supabase.removeChannel(channel);
    },
  };
}
