"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, UploadCloud, FileText, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import { createOrder, CURRENCIES } from "@/lib/orders";
import { uploadAttachment } from "@/lib/attachments";
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
  const [files, setFiles] = useState<File[]>([]);

  // Prefill the service when arriving from a service page (?service=…).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("service");
    if (!q) return;
    const match = SERVICES.find((s) => s.title.toLowerCase() === q.toLowerCase());
    setForm((f) => ({ ...f, service: match ? match.title : "Custom Project" }));
  }, []);

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
      // Upload any requirement files now that we have the order id.
      if (order.$id && files.length) {
        for (const file of files) {
          await uploadAttachment({ file, entityType: "order", entityId: order.$id, kind: "requirement", uploaderId: user.id }).catch(() => {});
        }
      }
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
      <PageHeader title="Place a Custom Order" subtitle="Order any project — pick a service or choose Custom / Other" />

      <form onSubmit={submit} className="glass-card p-6 sm:p-8 space-y-5 max-w-2xl">
        <label className="block">
          <span className={labelCls}>Service</span>
          <select value={form.service} onChange={set("service")} className={inputCls}>
            {SERVICES.map((s) => (
              <option key={s.title} value={s.title} className="bg-aura-card">
                {s.title}
              </option>
            ))}
            <option value="Custom Project" className="bg-aura-card">Custom / Other</option>
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

        <div className="block">
          <span className={labelCls}>Upload requirement files (optional)</span>
          <label className="mt-1.5 flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-white/15 hover:border-white/30 px-4 py-6 text-center transition-colors">
            <UploadCloud size={22} className="text-aura-cyan mb-2" />
            <span className="text-sm text-gray-300">Click to add files (designs, docs, references)</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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
