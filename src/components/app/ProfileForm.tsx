"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Mail, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updateProfile } from "@/lib/data";

export default function ProfileForm() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", company: "", phone: "" });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    getProfile(user.id)
      .then((p) => {
        if (p) {
          setForm({ name: p.name ?? "", company: p.company ?? "", phone: p.phone ?? "" });
          setEmail(p.email ?? user.email);
          setRole(p.role ?? user.role);
        } else {
          setForm({ name: user.name, company: "", phone: "" });
          setEmail(user.email);
          setRole(user.role);
        }
      })
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, [user?.id, user?.email, user?.name, user?.role]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const label = "text-xs font-semibold text-gray-400 uppercase tracking-widest";
  const input = "mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>;
  }

  return (
    <div className="max-w-2xl">
      {/* Identity card */}
      <div className="glass-card p-6 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl grid place-items-center text-2xl font-black text-white bg-gradient-to-br from-aura-purple to-aura-cyan shrink-0">
          {(form.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{form.name || "Your name"}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {email}</span>
            <span className="inline-flex items-center gap-1.5 capitalize"><Shield size={14} className="text-aura-cyan" /> {role}</span>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="glass-card p-6 space-y-5">
        <label className="block">
          <span className={label}>Full name</span>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
        </label>
        <label className="block">
          <span className={label}>Company</span>
          <input className={input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name (optional)" />
        </label>
        <label className="block">
          <span className={label}>Phone</span>
          <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 3xx xxxxxxx (optional)" />
        </label>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className={label}>Email</span>
            <input className={`${input} opacity-60 cursor-not-allowed`} value={email} disabled />
          </label>
          <label className="block">
            <span className={label}>Role</span>
            <input className={`${input} opacity-60 cursor-not-allowed capitalize`} value={role} disabled />
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary !py-2.5 text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
