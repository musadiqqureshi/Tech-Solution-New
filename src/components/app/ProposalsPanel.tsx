"use client";

import { useEffect, useState } from "react";
import { Loader2, FileSignature, Check, X, Send, Handshake, RefreshCw } from "lucide-react";
import { formatMoney } from "@/lib/orders";
import {
  listProposals, createProposal, counterProposal, approveProposal,
  rejectProposal, requestProposalRevision, type Proposal, type ProposalStatus,
} from "@/lib/proposals";
import type { Currency, Order } from "@/lib/types";

const CURRENCIES: Currency[] = ["USD", "PKR", "GBP", "EUR", "AUD", "CAD"];

const STATUS_STYLE: Record<ProposalStatus, string> = {
  submitted: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  countered: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
};

const input =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

export default function ProposalsPanel({
  order,
  role,
  userId,
  userName,
  onOrderUpdate,
}: {
  order: Order;
  role: "admin" | "client";
  userId: string;
  userName?: string;
  onOrderUpdate?: (o: Order) => void;
}) {
  const orderId = order.$id ?? "";
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  // Admin proposal form
  const [scope, setScope] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>(order.currency ?? "USD");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (!orderId) return;
    listProposals(orderId).then(setProposals).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  const hasApproved = proposals.some((p) => p.status === "approved");
  const replace = (p: Proposal) => setProposals((list) => list.map((x) => (x.id === p.id ? p : x)));

  const submit = async () => {
    if (!scope.trim() || !price.trim()) return setError("Scope and price are required.");
    setBusy("create");
    setError("");
    try {
      const p = await createProposal({
        orderId, authorId: userId, authorName: userName,
        scope: scope.trim(), price: Number(price), currency, deadline: deadline || undefined,
      });
      setProposals((list) => [p, ...list]);
      setScope(""); setPrice(""); setDeadline("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit proposal.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <FileSignature size={16} className="text-aura-cyan" /> Project Proposal
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {role === "admin"
          ? "Submit a proposal with scope, price, and deadline. The project starts only once the client approves."
          : "Review the team’s proposal. Approve to officially start the project, or negotiate the price / deadline."}
      </p>

      {loading ? (
        <Loader2 className="animate-spin text-aura-cyan" />
      ) : (
        <div className="space-y-3">
          {proposals.length === 0 && (
            <p className="text-sm text-gray-500">
              {role === "admin" ? "No proposal yet — submit one below." : "The team hasn’t submitted a proposal yet."}
            </p>
          )}
          {proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              role={role}
              locked={hasApproved && p.status !== "approved"}
              busy={busy}
              setBusy={setBusy}
              setError={setError}
              onChange={replace}
              onApproved={(updated, ord) => { replace(updated); onOrderUpdate?.(ord); }}
            />
          ))}
        </div>
      )}

      {/* Admin: submit a new proposal */}
      {role === "admin" && !hasApproved && (
        <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">New proposal</p>
          <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={3} placeholder="Scope of work…" className={input} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" className={input} />
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={input}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className={input} />
          </div>
          <button onClick={submit} disabled={!!busy} className="btn-primary !py-2 text-sm">
            {busy === "create" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Submit proposal
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}

function ProposalCard({
  proposal: p, role, locked, busy, setBusy, setError, onChange, onApproved,
}: {
  proposal: Proposal;
  role: "admin" | "client";
  locked: boolean;
  busy: string;
  setBusy: (s: string) => void;
  setError: (s: string) => void;
  onChange: (p: Proposal) => void;
  onApproved: (p: Proposal, o: Order) => void;
}) {
  const [mode, setMode] = useState<"" | "counter" | "revision">("");
  const [cPrice, setCPrice] = useState("");
  const [cDeadline, setCDeadline] = useState("");
  const [cNote, setCNote] = useState("");
  const [rNote, setRNote] = useState("");

  const wrap = async (key: string, fn: () => Promise<void>) => {
    setBusy(key); setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Action failed."); } finally { setBusy(""); }
  };

  const approve = () => wrap("approve-" + p.id, async () => {
    const { proposal, order } = await approveProposal(p);
    onApproved(proposal, order);
  });
  const reject = () => wrap("reject-" + p.id, async () => onChange(await rejectProposal(p.id)));
  const counter = () => wrap("counter-" + p.id, async () => {
    onChange(await counterProposal(p.id, {
      clientPrice: cPrice ? Number(cPrice) : undefined,
      clientDeadline: cDeadline || undefined,
      clientNote: cNote || undefined,
    }));
    setMode("");
  });
  const revise = () => wrap("revise-" + p.id, async () => {
    if (!rNote.trim()) return;
    onChange(await requestProposalRevision(p.id, rNote.trim()));
    setMode("");
  });

  const canAct = role === "client" && (p.status === "submitted" || p.status === "countered") && !locked;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{p.scope}</p>
          <p className="text-lg font-black gradient-text mt-1">{formatMoney(p.price, p.currency)}</p>
          <p className="text-xs text-gray-500">
            {p.authorName ? `by ${p.authorName}` : "Team"}
            {p.deadline && ` · due ${new Date(p.deadline).toLocaleDateString()}`}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLE[p.status]}`}>
          {p.status}
        </span>
      </div>

      {/* Client's negotiation shown to both sides */}
      {(p.clientPrice != null || p.clientDeadline || p.clientNote || p.revisionNote) && (
        <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/90 space-y-1">
          <p className="font-semibold flex items-center gap-1.5"><Handshake size={13} /> Client negotiation</p>
          {p.clientPrice != null && <p>Counter price: <span className="font-semibold">{formatMoney(p.clientPrice, p.currency)}</span></p>}
          {p.clientDeadline && <p>Preferred deadline: {new Date(p.clientDeadline).toLocaleDateString()}</p>}
          {p.clientNote && <p>Note: {p.clientNote}</p>}
          {p.revisionNote && <p>Revision requested: {p.revisionNote}</p>}
        </div>
      )}

      {/* Client actions */}
      {canAct && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {mode === "" && (
            <div className="flex flex-wrap gap-2">
              <button onClick={approve} disabled={!!busy} className="btn-primary !py-1.5 text-xs">
                {busy === "approve-" + p.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve & start
              </button>
              <button onClick={() => setMode("counter")} disabled={!!busy} className="btn-secondary !py-1.5 text-xs">
                <Handshake size={14} /> Negotiate
              </button>
              <button onClick={() => setMode("revision")} disabled={!!busy} className="btn-secondary !py-1.5 text-xs">
                <RefreshCw size={14} /> Request revision
              </button>
              <button onClick={reject} disabled={!!busy} className="btn-secondary !py-1.5 text-xs text-red-300">
                {busy === "reject-" + p.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
              </button>
            </div>
          )}
          {mode === "counter" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={cPrice} onChange={(e) => setCPrice(e.target.value)} type="number" placeholder="Your price" className={input} />
                <input value={cDeadline} onChange={(e) => setCDeadline(e.target.value)} type="date" className={input} />
              </div>
              <textarea value={cNote} onChange={(e) => setCNote(e.target.value)} rows={2} placeholder="Add a note for the team…" className={input} />
              <div className="flex gap-2">
                <button onClick={counter} disabled={!!busy} className="btn-primary !py-1.5 text-xs">
                  {busy === "counter-" + p.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send counter
                </button>
                <button onClick={() => setMode("")} className="btn-secondary !py-1.5 text-xs">Cancel</button>
              </div>
            </div>
          )}
          {mode === "revision" && (
            <div className="space-y-2">
              <textarea value={rNote} onChange={(e) => setRNote(e.target.value)} rows={2} placeholder="Describe the revision you want to the proposal…" className={input} />
              <div className="flex gap-2">
                <button onClick={revise} disabled={!!busy || !rNote.trim()} className="btn-primary !py-1.5 text-xs">
                  {busy === "revise-" + p.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send revision
                </button>
                <button onClick={() => setMode("")} className="btn-secondary !py-1.5 text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {p.status === "approved" && (
        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-emerald-300 flex items-center gap-1.5">
          <Check size={14} /> Approved — the project has officially started.
        </p>
      )}
    </div>
  );
}
