"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Fields";
import { supabase } from "@/lib/supabase";
import { registerCompany, type CompanyPlan, PLAN_LABEL } from "@/lib/saas";

const PLANS: CompanyPlan[] = ["starter", "professional", "enterprise"];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planParam = (params.get("plan") || "").toLowerCase();
  const initialPlan: CompanyPlan = PLANS.includes(planParam as CompanyPlan) ? (planParam as CompanyPlan) : "starter";

  const [f, setF] = useState({ company: "", name: "", email: "", password: "", plan: initialPlan });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.company.trim() || !f.name.trim() || !f.email.trim()) return setError("Please fill in all fields.");
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      // Create the account (or sign in if it already exists).
      const { data: signUp, error: suErr } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: { data: { name: f.name } },
      });
      if (suErr && !/already registered/i.test(suErr.message)) throw suErr;
      let userId = signUp.user?.id;
      if (!signUp.session) {
        const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (siErr) throw new Error("Account exists. Please use Company Login instead.");
        userId = si.user?.id;
      }
      if (!userId) throw new Error("Could not create your account.");
      await registerCompany({ name: f.company.trim(), plan: f.plan, userId, userName: f.name.trim(), userEmail: f.email.trim() });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setLoading(false);
    }
  };

  const sel = "mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-aura-purple/50";

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Company name" value={f.company} onChange={(v) => setF({ ...f, company: v })} />
      <Field label="Your name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label="Work email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
      <Field label="Password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} />
      <label className="block">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Plan</span>
        <select className={sel} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as CompanyPlan })}>
          {PLANS.map((p) => (<option key={p} value={p}>{PLAN_LABEL[p]}</option>))}
        </select>
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Building2 size={18} /> Create workspace</>}
      </button>
      <p className="text-center text-sm text-gray-400">
        Already have a workspace?{" "}
        <Link href="/company-login" className="text-aura-cyan hover:underline">Company login</Link>
      </p>
      <p className="text-center text-[11px] text-gray-500">14-day free trial · no card required · billing activates soon</p>
    </form>
  );
}

export default function CompanyRegisterPage() {
  return (
    <AuthShell title="Start your workspace" subtitle="Run your IT company on Tech Solutions SaaS">
      <Suspense fallback={<Loader2 className="animate-spin mx-auto text-aura-cyan" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
