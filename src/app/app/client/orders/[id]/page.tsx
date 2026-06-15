"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Tag, FileText, Download, ExternalLink, MessageCircle, Send, Check, Star } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/app/ui";
import { StatusBadge, StatusTimeline } from "@/components/app/OrderBits";
import { getOrder, setOrderFollowUp, formatMoney } from "@/lib/orders";
import { getMyOrderReview, submitReview } from "@/lib/reviews";
import { listOrderInvoices } from "@/lib/invoices";
import { InvoiceBadge } from "@/components/app/InvoiceDocument";
import type { Order, Review, Invoice } from "@/lib/types";

export default function OrderDetail() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [savingFu, setSavingFu] = useState(false);
  const [fuSaved, setFuSaved] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!params.id) return;
    getOrder(params.id)
      .then((o) => {
        setOrder(o);
        setFollowUp(o.followUp ?? "");
        if (o.$id) listOrderInvoices(o.$id).then(setInvoices).catch(() => {});
        if (user?.id && o.$id) getMyOrderReview(o.$id, user.id).then(setReview).catch(() => {});
      })
      .catch(() => setError("Order not found or you don’t have access."))
      .finally(() => setLoading(false));
  }, [params.id, user?.id]);

  const submitMyReview = async () => {
    if (!order?.$id || !user) return;
    setSavingReview(true);
    try {
      const r = await submitReview({
        orderId: order.$id,
        clientId: user.id,
        clientName: user.name,
        rating,
        comment: comment.trim() || undefined,
      });
      setReview(r);
    } finally {
      setSavingReview(false);
    }
  };

  const submitFollowUp = async () => {
    if (!order?.$id || !followUp.trim()) return;
    setSavingFu(true);
    try {
      setOrder(await setOrderFollowUp(order.$id, followUp.trim()));
      setFuSaved(true);
      setTimeout(() => setFuSaved(false), 2500);
    } finally {
      setSavingFu(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 size={28} className="animate-spin text-aura-cyan" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <Link href="/app/client/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <div className="glass-card p-10 text-center text-gray-400">{error || "Not found."}</div>
      </>
    );
  }

  const created = order.$createdAt
    ? new Date(order.$createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

  return (
    <>
      <Link href="/app/client/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <span className="font-mono text-sm text-aura-cyan">{order.orderNumber}</span>
        <StatusBadge status={order.status} />
        <span className={`text-xs px-2 py-0.5 rounded-full ${order.paid ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-gray-400"}`}>
          {order.paid ? "Paid" : "Unpaid"}
        </span>
      </div>
      <PageHeader title={order.title} />

      {/* Progress */}
      <div className="glass-card p-6 mb-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Progress</h3>
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Details */}
        <div className="md:col-span-2 space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3">Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{order.description}</p>
          </div>
          {order.requirements && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3">Requirements</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{order.requirements}</p>
            </div>
          )}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Download size={16} className="text-aura-cyan" /> Final Delivery
            </h3>
            {order.deliveryLink ? (
              <a href={order.deliveryLink} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2 text-sm">
                <ExternalLink size={15} /> Open / Download Delivery
              </a>
            ) : (
              <p className="text-sm text-gray-500">
                No delivery yet — your final files/link will appear here once the project is delivered.
              </p>
            )}
          </div>

          {/* Invoices */}
          {invoices.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-aura-cyan" /> Invoices
              </h3>
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Link
                    key={inv.$id}
                    href={`/app/client/invoices/${inv.$id}`}
                    className="flex items-center gap-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-aura-cyan">{inv.invoiceNumber}</span>
                        <InvoiceBadge status={inv.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {inv.phase === "advance" ? "30% advance" : inv.phase === "final" ? "70% final" : "Full"} · {formatMoney(inv.amount, inv.currency)}
                      </p>
                    </div>
                    <Download size={15} className="text-gray-400 shrink-0" />
                  </Link>
                ))}
              </div>
              {invoices.some((i) => i.phase === "advance" && i.status === "unpaid") && (
                <p className="text-xs text-amber-400/90 mt-3">
                  Please download and pay the 30% advance invoice — your project will be started once the advance is confirmed.
                </p>
              )}
            </div>
          )}

          {/* Follow-up request (after delivery) */}
          {(order.status === "delivered" || order.status === "completed") && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MessageCircle size={16} className="text-aura-gold" /> Request a Follow-up
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Need revisions or have a reference link? Send a follow-up request and our team will pick it up.
              </p>
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                rows={3}
                placeholder="Describe the changes you need, and paste any reference link…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
              />
              <button onClick={submitFollowUp} disabled={savingFu || !followUp.trim()} className="btn-primary !py-2 text-sm mt-3">
                {savingFu ? <Loader2 size={15} className="animate-spin" /> : fuSaved ? <Check size={15} /> : <Send size={15} />}
                {fuSaved ? "Sent" : "Send Follow-up"}
              </button>
            </div>
          )}

          {/* Review (after delivery) */}
          {(order.status === "delivered" || order.status === "completed") && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-aura-gold" /> {review ? "Your Review" : "Write a Review"}
              </h3>
              {review ? (
                <div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={18} className={n <= review.rating ? "text-aura-gold fill-aura-gold" : "text-gray-600"} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-gray-300">{review.comment}</p>}
                  <p className="text-xs text-gray-600 mt-2">
                    Thanks for your feedback!{review.approved ? " It’s featured on our site." : " Pending review."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)}>
                        <Star size={26} className={n <= rating ? "text-aura-gold fill-aura-gold" : "text-gray-600 hover:text-gray-400"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="How was your experience working with us?"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none"
                  />
                  <button onClick={submitMyReview} disabled={savingReview} className="btn-primary !py-2 text-sm mt-3">
                    {savingReview ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />} Submit Review
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-3">
          <div className="glass-card p-5 space-y-4">
            <Meta icon={Tag} label="Service" value={order.service} />
            <Meta icon={Calendar} label="Created" value={created} />
            {order.deadline && <Meta icon={Calendar} label="Deadline" value={new Date(order.deadline).toLocaleDateString()} />}
            <Meta icon={FileText} label="Budget" value={formatMoney(order.budget, order.currency)} />
            {order.requirementLink && (
              <div className="flex items-start gap-3">
                <ExternalLink size={16} className="text-aura-purple mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500">Requirement files</p>
                  <a href={order.requirementLink} target="_blank" rel="noopener noreferrer" className="text-sm text-aura-cyan hover:underline break-all">
                    Open link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-aura-purple mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
