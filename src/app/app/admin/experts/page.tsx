"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Plus, X, Pencil, Trash2, Eye, EyeOff, Check } from "lucide-react";
import { useRequireRole } from "@/components/app/PortalGuard";
import { PageHeader } from "@/components/app/ui";
import {
  listAllExperts, createExpert, updateExpert, deleteExpert, setExpertVisible,
  type ExpertInput,
} from "@/lib/data";
import type { Expert } from "@/lib/types";

const EMPTY: ExpertInput = { name: "", role: "", skills: [], avatarUrl: "", visibleOnHomepage: true };

export default function AdminExperts() {
  useRequireRole(["admin"]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Expert | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState("");

  const load = () => listAllExperts().then(setExperts).catch(() => setExperts([]));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (e: Expert) => {
    setEditing(e);
    setShowForm(true);
  };

  const toggle = async (e: Expert) => {
    if (!e.$id) return;
    setBusy(e.$id);
    try {
      const u = await setExpertVisible(e.$id, !e.visibleOnHomepage);
      setExperts((prev) => prev.map((x) => (x.$id === u.$id ? u : x)));
    } finally {
      setBusy("");
    }
  };

  const remove = async (e: Expert) => {
    if (!e.$id || !confirm(`Remove ${e.name} from the directory?`)) return;
    setBusy(e.$id);
    try {
      await deleteExpert(e.$id);
      setExperts((prev) => prev.filter((x) => x.$id !== e.$id));
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Expert Management" subtitle="Manage your public expert roster" />
        <button onClick={openNew} className="btn-primary !py-2 text-sm">
          <Plus size={16} /> Add Expert
        </button>
      </div>

      {showForm && (
        <ExpertForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-aura-cyan" /></div>
      ) : experts.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Users size={26} className="text-aura-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">No experts yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {experts.map((e) => (
            <div key={e.$id} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-aura-purple/40 to-aura-cyan/30 grid place-items-center text-white font-bold shrink-0 overflow-hidden">
                  {e.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.avatarUrl} alt={e.name} className="w-full h-full object-cover" />
                  ) : (
                    e.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold truncate">{e.name}</h3>
                  <p className="text-xs text-gray-400">{e.role}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-aura-purple/15 text-aura-purple">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                <button onClick={() => toggle(e)} disabled={!!busy} title="Toggle homepage visibility" className="btn-secondary !p-2">
                  {busy === e.$id ? <Loader2 size={14} className="animate-spin" /> : e.visibleOnHomepage ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <span className="text-xs text-gray-500 flex-1">
                  {e.visibleOnHomepage ? "On homepage" : "Hidden"}
                </span>
                <button onClick={() => openEdit(e)} className="btn-secondary !p-2" title="Edit"><Pencil size={14} /></button>
                <button onClick={() => remove(e)} disabled={!!busy} className="btn-secondary !p-2" title="Remove"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ExpertForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Expert | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    skills: (initial?.skills ?? []).join(", "),
    avatarUrl: initial?.avatarUrl ?? "",
    visibleOnHomepage: initial?.visibleOnHomepage ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.name || !f.role) return setError("Name and role are required.");
    setSaving(true);
    const payload: ExpertInput = {
      name: f.name,
      role: f.role,
      skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      avatarUrl: f.avatarUrl || undefined,
      visibleOnHomepage: f.visibleOnHomepage,
    };
    try {
      if (initial?.$id) await updateExpert(initial.$id, payload);
      else await createExpert(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-aura-purple/50 outline-none";

  return (
    <form onSubmit={submit} className="glass-card p-6 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{initial ? "Edit expert" : "New expert"}</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input className={input} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={input} placeholder="Role (e.g. Backend Engineer)" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} />
      </div>
      <input className={input} placeholder="Skills (comma-separated)" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} />
      <input className={input} placeholder="Avatar image URL (optional)" value={f.avatarUrl} onChange={(e) => setF({ ...f, avatarUrl: e.target.value })} />
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input type="checkbox" checked={f.visibleOnHomepage} onChange={(e) => setF({ ...f, visibleOnHomepage: e.target.checked })} />
        Show on homepage
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary !py-2 text-sm">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {initial ? "Save changes" : "Add expert"}
      </button>
    </form>
  );
}
