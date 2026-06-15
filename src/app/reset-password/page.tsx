"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Fields";
import { useAuth } from "@/context/AuthContext";

function ResetForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const secret = params.get("secret") ?? "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = userId && secret;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords don’t match.");
    setLoading(true);
    try {
      await resetPassword(userId, secret, form.password);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!valid) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Invalid or expired reset link.{" "}
        <Link href="/forgot-password" className="text-aura-cyan hover:underline">
          Request a new one
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="New password" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
      <Field label="Confirm password" type="password" value={form.confirm} onChange={(v) => setForm((f) => ({ ...f, confirm: v }))} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account">
      <Suspense fallback={<Loader2 className="animate-spin mx-auto text-aura-cyan" />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
