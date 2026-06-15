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

export type TaskStatus =
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "completed";

export interface Task {
  $id?: string;
  $createdAt?: string;
  orderId?: string;
  title: string;
  description: string;
  expertId: string;
  expertName?: string;
  status: TaskStatus;
  deadline?: string;
  expertBudget?: number;
  clientBudget?: number; // admin-only (profit source)
  currency?: Currency;
}

/** An expert option for admin task assignment. */
export interface ExpertOption {
  id: string;
  name: string;
  email: string;
}

export type MeetingStatus = "requested" | "confirmed" | "declined" | "completed";

export interface Meeting {
  $id?: string;
  $createdAt?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  topic: string;
  notes?: string;
  preferredAt: string;
  durationMin: number;
  status: MeetingStatus;
  meetingLink?: string;
}

export interface ChatMessage {
  $id?: string;
  peerId: string;
  fromAdmin: boolean;
  senderName: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export type InvoiceStatus = "unpaid" | "paid" | "void";

export interface Invoice {
  $id?: string;
  $createdAt?: string;
  invoiceNumber: string;
  orderId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  description: string;
  amount: number;
  currency?: Currency;
  status: InvoiceStatus;
  issuedDate?: string;
  dueDate?: string;
  source?: "manual" | "auto";
}
