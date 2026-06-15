"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Download, Upload, Check, ExternalLink } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { InvoiceDocument } from "@/components/app/InvoiceDocument";
import { getInvoice, submitPaymentProof } from "@/lib/invoices";
import type { Invoice } from "@/lib/types";

export default function ClientInvoiceDetail() {
  useRequireRole(["client", "admin"]);
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!params.id) return;
    getInvoice(params.id)
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const upload = async (file: File) => {
    if (!invoice?.$id) return;
    setUploading(true);
    setError("");
    try {
      const url = await submitPaymentProof(invoice.$id, file);
      setInvoice({ ...invoice, paymentProofUrl: url, paymentSubmittedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
      <div className="flex items-center justify-between no-print">
        <Back />
        <button onClick={() => window.print()} className="btn-primary !py-2 text-sm">
          <Download size={15} /> Download PDF
        </button>
      </div>

      <div className="mt-5 flex justify-center">
        <InvoiceDocument invoice={invoice} />
      </div>

      {/* Payment proof upload */}
      {invoice.status !== "void" && (
        <div className="no-print mt-5 max-w-3xl mx-auto">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Upload size={16} className="text-aura-cyan" /> Payment Confirmation
            </h3>
            {invoice.status === "paid" ? (
              <p className="text-sm text-emerald-400">This invoice is marked paid. Thank you!</p>
            ) : invoice.paymentProofUrl ? (
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <Check size={15} className="text-emerald-400" /> Payment proof submitted — awaiting admin confirmation.
                </p>
                <a href={invoice.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-aura-cyan hover:underline inline-flex items-center gap-1 mt-2">
                  <ExternalLink size={14} /> View uploaded screenshot
                </a>
                <button onClick={() => fileRef.current?.click()} className="btn-secondary !py-2 text-sm mt-3 block">
                  Replace screenshot
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-3">
                  Paid by bank transfer, JazzCash, Easypaisa, or card? Upload a screenshot of your payment and we’ll confirm it.
                </p>
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-primary !py-2 text-sm">
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? "Uploading…" : "Upload payment screenshot"}
                </button>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </div>
      )}
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
