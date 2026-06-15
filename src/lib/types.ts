export type UserRole = "client" | "expert" | "admin";

export interface Profile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

export interface LeadRequest {
  service: string;
  budget: string;
  timeline: string;
  description: string;
  name: string;
  email: string;
  status?: "new" | "contacted" | "qualified" | "converted";
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Expert {
  $id?: string;
  name: string;
  role: string;
  skills: string[];
  avatarUrl?: string;
  visibleOnHomepage?: boolean;
}
