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

export type Currency = "USD" | "PKR" | "GBP" | "EUR" | "AUD" | "CAD";

export type OrderStatus =
  | "pending"
  | "approved"
  | "in_progress"
  | "delivered"
  | "completed"
  | "rejected";

export interface Order {
  $id?: string;
  $createdAt?: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  service: string;
  title: string;
  description: string;
  requirements?: string;
  budget?: number;
  currency?: Currency;
  status: OrderStatus;
  paid?: boolean;
  requirementFileIds?: string[];
  deliverableFileIds?: string[];
}

export interface Expert {
  $id?: string;
  name: string;
  role: string;
  skills: string[];
  avatarUrl?: string;
  visibleOnHomepage?: boolean;
}
