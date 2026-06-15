"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Fields";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send recovery email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="We’ll email you a recovery link">
      {sent ? (
        <div className="text-center py-4">
          <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-gray-300 text-sm">
            If an account exists for <span className="text-white">{email}</span>, a
            recovery link is on its way.
          </p>
          <Link href="/login" className="btn-secondary w-full mt-6">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Recovery Link"}
          </button>
          <Link href="/login" className="block text-center text-sm text-aura-cyan hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
