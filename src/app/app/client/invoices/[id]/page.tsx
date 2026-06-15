"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { InvoiceDocument } from "@/components/app/InvoiceDocument";
import { getInvoice } from "@/lib/invoices";
import type { Invoice } from "@/lib/types";

export default function ClientInvoiceDetail() {
  useRequireRole(["client", "admin"]);
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getInvoice(params.id)
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="grid place-items-center py-32"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>;
  if (!invoice) return (
    <>
      <Back />
      <div className="glass-card p-10 text-center text-gray-400">Invoice not found.</div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between no-print">
        <Back />
        <button onClick={() => window.print()} className="btn-primary !py-2 text-sm">
          <Download size={15} /> Download PDF
        </button>
      </div>
      <div className="mt-5 flex justify-center">
        <InvoiceDocument invoice={invoice} />
      </div>
    </>
  );
}

function Back() {
  return (
    <Link href="/app/client/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
      <ArrowLeft size={16} /> Back to invoices
    </Link>
  );
}
