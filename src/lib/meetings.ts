import { supabase, isSupabaseConfigured } from "./supabase";
import type { Meeting, MeetingStatus } from "./types";

export const MEETING_STATUS_META: Record<
  MeetingStatus,
  { label: string; color: string }
> = {
  requested: { label: "Requested", color: "#fbbf24" },
  confirmed: { label: "Confirmed", color: "#34d399" },
  declined: { label: "Declined", color: "#f87171" },
  completed: { label: "Completed", color: "#60a5fa" },
};

function rowToMeeting(r: Record<string, unknown>): Meeting {
  return {
    $id: r.id as string,
    $createdAt: r.created_at as string,
    clientId: r.client_id as string,
    clientName: r.client_name as string,
    clientEmail: r.client_email as string,
    topic: r.topic as string,
    notes: (r.notes as string) ?? undefined,
    preferredAt: r.preferred_at as string,
    durationMin: Number(r.duration_min ?? 30),
    status: r.status as MeetingStatus,
    meetingLink: (r.meeting_link as string) ?? undefined,
  };
}

export interface NewMeetingInput {
  clientId: string;
  clientName: string;
  clientEmail: string;
  topic: string;
  notes?: string;
  preferredAt: string; // ISO
  durationMin?: number;
}

export async function requestMeeting(input: NewMeetingInput): Promise<Meeting> {
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      client_id: input.clientId,
      client_name: input.clientName,
      client_email: input.clientEmail,
      topic: input.topic,
      notes: input.notes ?? null,
      preferred_at: input.preferredAt,
      duration_min: input.durationMin ?? 30,
      status: "requested",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMeeting(data);
}

export async function listClientMeetings(clientId: string): Promise<Meeting[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("client_id", clientId)
    .order("preferred_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(rowToMeeting);
}

export async function listAllMeetings(): Promise<Meeting[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("preferred_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(rowToMeeting);
}

/** Admin: confirm/decline/complete a meeting and optionally set a link. */
export async function updateMeeting(
  id: string,
  fields: { status?: MeetingStatus; meetingLink?: string }
): Promise<Meeting> {
  const patch: Record<string, unknown> = {};
  if (fields.status) patch.status = fields.status;
  if (fields.meetingLink !== undefined) patch.meeting_link = fields.meetingLink || null;
  const { data, error } = await supabase
    .from("meetings")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToMeeting(data);
}

/** Build a "Add to Google Calendar" URL for a meeting. */
export function googleCalendarUrl(m: Meeting): string {
  const start = new Date(m.preferredAt);
  const end = new Date(start.getTime() + (m.durationMin || 30) * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Tech Solutions — ${m.topic}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${m.notes ?? "Consultation with Tech Solutions Pakistan."}${
      m.meetingLink ? `\n\nJoin: ${m.meetingLink}` : ""
    }`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
