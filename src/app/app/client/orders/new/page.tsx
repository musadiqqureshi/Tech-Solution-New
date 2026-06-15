"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { createOrder, CURRENCIES } from "@/lib/orders";
import { SERVICES } from "@/lib/constants";
import type { Currency } from "@/lib/types";

const labelCls = "text-xs font-semibold text-gray-400 uppercase tracking-widest";
const inputCls =
  "mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple transition-colors";

export default function NewOrder() {
  useRequireRole(["client", "admin"]);
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    service: SERVICES[0].title,
    title: "",
    description: "",
    requirements: "",
    requirementLink: "",
    deadline: "",
    budget: "",
    currency: "USD" as Currency,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    if (!form.title.trim() || !form.description.trim()) {
      setError("Please add a title and description.");
      return;
    }
    setSaving(true);
    try {
      const order = await createOrder({
        clientId: user.id,
        clientName: user.name,
        clientEmail: user.email,
        service: form.service,
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        requirementLink: form.requirementLink.trim() || undefined,
        deadline: form.deadline || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        currency: form.currency,
      });
      router.push(order.$id ? `/app/client/orders/${order.$id}` : "/app/client/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the order.");
      setSaving(false);
    }
  };

  return (
    <>
      <Link href="/app/client/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={16} /> Back to orders
      </Link>
      <PageHeader title="New Order" subtitle="Tell us about your project" />

      <form onSubmit={submit} className="glass-card p-6 sm:p-8 space-y-5 max-w-2xl">
        <label className="block">
          <span className={labelCls}>Service</span>
          <select value={form.service} onChange={set("service")} className={inputCls}>
            {SERVICES.map((s) => (
              <option key={s.title} value={s.title} className="bg-aura-card">
                {s.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelCls}>Project title</span>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Clinic appointment booking platform"
            className={inputCls}
            required
          />
        </label>

        <label className="block">
          <span className={labelCls}>Description</span>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={4}
            placeholder="What are you building and what problem does it solve?"
            className={`${inputCls} resize-none`}
            required
          />
        </label>

        <label className="block">
          <span className={labelCls}>Requirements (optional)</span>
          <textarea
            value={form.requirements}
            onChange={set("requirements")}
            rows={3}
            placeholder="Key features, integrations, anything specific..."
            className={`${inputCls} resize-none`}
          />
        </label>

        <label className="block">
          <span className={labelCls}>Requirement files / source link (optional)</span>
          <input
            value={form.requirementLink}
            onChange={set("requirementLink")}
            placeholder="GitHub, Google Drive, or OneDrive link"
            className={inputCls}
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Paste a GitHub repo, Google Drive, or OneDrive link with your requirement files.
          </span>
        </label>

        <label className="block">
          <span className={labelCls}>Preferred deadline (optional)</span>
          <input
            type="date"
            value={form.deadline}
            onChange={set("deadline")}
            min={new Date().toISOString().split("T")[0]}
            className={inputCls}
          />
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="block col-span-2">
            <span className={labelCls}>Budget (optional)</span>
            <input
              type="number"
              min="0"
              value={form.budget}
              onChange={set("budget")}
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Currency</span>
            <select value={form.currency} onChange={set("currency")} className={inputCls}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-aura-card">
                  {c.code}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><Send size={18} /> Submit Order</>}
          </button>
          <Link href="/app/client/orders" className="btn-secondary">Cancel</Link>
        </div>
        <p className="text-xs text-gray-500">
          Your order starts as <span className="text-amber-400">Pending Review</span>. We’ll
          review and approve it, then keep you posted as work progresses.
        </p>
      </form>
    </>
  );
}
