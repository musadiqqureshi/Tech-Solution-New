"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Download, Check, Ban, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { InvoiceDocument } from "@/components/app/InvoiceDocument";
import { getInvoice, updateInvoiceStatus } from "@/lib/invoices";
import type { Invoice } from "@/lib/types";

export default function AdminInvoiceDetail() {
  useRequireRole(["admin"]);
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!params.id) return;
    getInvoice(params.id)
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const setStatus = async (status: Invoice["status"]) => {
    if (!invoice?.$id) return;
    setBusy(status);
    try {
      setInvoice(await updateInvoiceStatus(invoice.$id, status));
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="grid place-items-center py-32"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>;
  if (!invoice) return (
    <>
      <Back />
      <div className="glass-card p-10 text-center text-gray-400">Invoice not found.</div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <Back />
        <div className="flex gap-2">
          {invoice.status !== "paid" && (
            <button onClick={() => setStatus("paid")} disabled={!!busy} className="btn-secondary !py-2 text-sm">
              {busy === "paid" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Mark Paid
            </button>
          )}
          {invoice.status !== "void" && (
            <button onClick={() => setStatus("void")} disabled={!!busy} className="btn-secondary !py-2 text-sm">
              <Ban size={15} /> Void
            </button>
          )}
          <button onClick={() => window.print()} className="btn-primary !py-2 text-sm">
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>
      {invoice.paymentProofUrl && (
        <div className="no-print mt-5 max-w-3xl mx-auto">
          <div className="glass-card p-6 border border-emerald-500/30">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ImageIcon size={16} className="text-emerald-400" /> Client Payment Proof
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Submitted {invoice.paymentSubmittedAt ? new Date(invoice.paymentSubmittedAt).toLocaleString() : ""}.
              Verify it, then mark the invoice paid.
            </p>
            <a href={invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={invoice.paymentProofUrl} alt="Payment proof" className="max-h-80 rounded-lg border border-white/10" />
            </a>
            <a href={invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1 mt-3">
              <ExternalLink size={14} /> Open full size
            </a>
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <InvoiceDocument invoice={invoice} />
      </div>
    </>
  );
}

function Back() {
  return (
    <Link href="/app/admin/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
      <ArrowLeft size={16} /> Back to invoices
    </Link>
  );
}
