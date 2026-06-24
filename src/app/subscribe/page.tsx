"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Rocket, ArrowLeft, Bell, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function SubscribeInner() {
  const params = useSearchParams();
  const plan = params.get("plan");

  return (
    <main className="bg-aura-mesh min-h-screen flex items-center justify-center px-4 py-28 relative overflow-hidden">
      <div className="orb w-96 h-96 top-1/4 left-1/4 bg-aura-purple" style={{ filter: "blur(120px)", opacity: 0.16 }} />
      <div className="orb w-80 h-80 bottom-1/4 right-1/4 bg-aura-cyan" style={{ filter: "blur(100px)", opacity: 0.14 }} />

      <section className="relative z-10 text-center max-w-2xl">
        <div className="w-20 h-20 rounded-3xl grid place-items-center mx-auto mb-7 bg-gradient-to-br from-aura-purple via-aura-blue to-aura-cyan">
          <Rocket size={38} className="text-white" />
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>
          <Sparkles size={12} /> SaaS Platform
        </span>

        <h1 className="text-5xl sm:text-7xl font-black leading-none mb-5">
          <span className="gradient-text">Coming Soon</span>
        </h1>

        {plan && (
          <p className="text-lg text-white font-semibold mb-2">
            You picked the <span className="gradient-text">{plan}</span> plan
          </p>
        )}

        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-9">
          We’re putting the finishing touches on the Tech Solutions SaaS platform — your own
          workspace to manage clients, projects, tasks, teams, invoices, and support tickets.
          Subscriptions open very soon.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            <Bell size={18} /> Notify me at launch
          </Link>
          <Link href="/pricing" className="btn-secondary">
            <ArrowLeft size={18} /> Back to pricing
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Already a client of an IT company on our platform? Your portal is available from the{" "}
          <Link href="/login" className="text-aura-cyan hover:underline">login page</Link>.
        </p>
      </section>
    </main>
  );
}

export default function SubscribePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-aura-mesh" />}>
        <SubscribeInner />
      </Suspense>
      <Footer />
    </>
  );
}
