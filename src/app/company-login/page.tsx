"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Fields";
import { supabase } from "@/lib/supabase";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (err) throw err;
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Company login" subtitle="Access your company workspace">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Work email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
        <Field label="Password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18} /> Sign in</>}
        </button>
        <p className="text-center text-sm text-gray-400">
          New here?{" "}
          <Link href="/company-register" className="text-aura-cyan hover:underline">Create a workspace</Link>
        </p>
      </form>
    </AuthShell>
  );
}
