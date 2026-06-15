"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { InvoiceBadge } from "@/components/app/InvoiceDocument";
import { listClientInvoices } from "@/lib/invoices";
import { formatMoney } from "@/lib/orders";
import type { Invoice } from "@/lib/types";

export default function ClientInvoices() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    listClientInvoices(user.id)
      .then(setInvoices)
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const due = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.amount, 0);
  const cur = invoices.find((i) => i.currency)?.currency;

  return (
    <>
      <PageHeader title="Invoices" subtitle="Payment history and downloads" />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Total Paid</p>
          <p className="text-xl font-black text-emerald-400">{formatMoney(paid, cur)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Amount Due</p>
          <p className="text-xl font-black text-amber-400">{formatMoney(due, cur)}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : invoices.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FileText size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No invoices yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link key={inv.$id} href={`/app/client/invoices/${inv.$id}`} className="glass-card glass-card-hover p-5 flex items-center gap-4 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs text-aura-cyan">{inv.invoiceNumber}</span>
                  <InvoiceBadge status={inv.status} />
                </div>
                <p className="text-sm text-gray-400 mt-1 truncate">{inv.description}</p>
                {inv.issuedDate && <p className="text-[11px] text-gray-600 mt-0.5">Issued {inv.issuedDate}</p>}
              </div>
              <span className="text-white font-bold shrink-0">{formatMoney(inv.amount, inv.currency)}</span>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
