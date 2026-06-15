import { databases, appwriteConfig, isAppwriteConfigured, ID } from "./appwrite";
import { Query, Permission, Role } from "appwrite";
import type { Order, OrderStatus, Currency } from "./types";

const { databaseId, ordersCollectionId } = appwriteConfig;

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "PKR", symbol: "₨", label: "Pakistani Rupee" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; step: number }
> = {
  pending: { label: "Pending Review", color: "#fbbf24", step: 0 },
  approved: { label: "Approved", color: "#60a5fa", step: 1 },
  in_progress: { label: "In Progress", color: "#a78bfa", step: 2 },
  delivered: { label: "Delivered", color: "#22d3ee", step: 3 },
  completed: { label: "Completed", color: "#34d399", step: 4 },
  rejected: { label: "Rejected", color: "#f87171", step: -1 },
};

/** Ordered status flow for the progress timeline (excludes rejected). */
export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "approved",
  "in_progress",
  "delivered",
  "completed",
];

export function formatMoney(amount?: number, currency?: Currency): string {
  if (amount == null) return "—";
  const c = CURRENCIES.find((x) => x.code === currency);
  return `${c?.symbol ?? ""}${amount.toLocaleString()}`;
}

/** Build the next order number: TSP-YYYYMM-XXXX (sequence resets monthly). */
async function nextOrderNumber(): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `TSP-${ym}-`;
  let seq = 1;
  if (isAppwriteConfigured) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    try {
      const res = await databases.listDocuments(databaseId, ordersCollectionId, [
        Query.greaterThanEqual("$createdAt", monthStart),
        Query.limit(1),
      ]);
      seq = res.total + 1;
    } catch {
      seq = 1;
    }
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export interface NewOrderInput {
  clientId: string;
  clientName: string;
  clientEmail: string;
  service: string;
  title: string;
  description: string;
  requirements?: string;
  budget?: number;
  currency?: Currency;
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const orderNumber = await nextOrderNumber();
  const doc: Order = {
    ...input,
    orderNumber,
    status: "pending",
    paid: false,
  };

  if (!isAppwriteConfigured) {
    console.info("[dev] Order created (Appwrite not configured):", doc);
    return { ...doc, $id: "dev", $createdAt: new Date().toISOString() };
  }

  // Document-level security: owner can read; admin team manages.
  const created = await databases.createDocument(
    databaseId,
    ordersCollectionId,
    ID.unique(),
    doc,
    [
      Permission.read(Role.user(input.clientId)),
      Permission.update(Role.user(input.clientId)),
      Permission.read(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ]
  );
  return created as unknown as Order;
}

export async function listClientOrders(clientId: string): Promise<Order[]> {
  if (!isAppwriteConfigured) return [];
  const res = await databases.listDocuments(databaseId, ordersCollectionId, [
    Query.equal("clientId", clientId),
    Query.orderDesc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents as unknown as Order[];
}

export async function getOrder(id: string): Promise<Order> {
  const doc = await databases.getDocument(databaseId, ordersCollectionId, id);
  return doc as unknown as Order;
}

/** Admin: list every order across all clients, newest first. */
export async function listAllOrders(status?: OrderStatus): Promise<Order[]> {
  if (!isAppwriteConfigured) return [];
  const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];
  if (status) queries.push(Query.equal("status", status));
  const res = await databases.listDocuments(databaseId, ordersCollectionId, queries);
  return res.documents as unknown as Order[];
}

/** Admin: update an order's status and/or payment flag. */
export async function updateOrder(
  id: string,
  fields: Partial<Pick<Order, "status" | "paid">>
): Promise<Order> {
  const doc = await databases.updateDocument(databaseId, ordersCollectionId, id, fields);
  return doc as unknown as Order;
}

/** The status an order advances to next (null if terminal). */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const order: OrderStatus[] = ["approved", "in_progress", "delivered", "completed"];
  const idx = order.indexOf(status);
  if (status === "pending") return "approved";
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
  return null;
}
