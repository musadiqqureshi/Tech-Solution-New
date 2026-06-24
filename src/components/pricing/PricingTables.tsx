"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";

interface Plan {
  name: string;
  blurb: string;
  monthly: number | null; // null = custom
  highlight?: boolean;
  cta: { label: string; href: string };
  features: { label: string; included: boolean }[];
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    blurb: "For small IT teams getting organized.",
    monthly: 14.99,
    cta: { label: "Get Started", href: "/company-register?plan=starter" },
    features: [
      { label: "Up to 5 users", included: true },
      { label: "10 projects", included: true },
      { label: "10 clients", included: true },
      { label: "Task management", included: true },
      { label: "Client portal", included: true },
      { label: "Invoicing & payments", included: true },
      { label: "Support tickets", included: true },
      { label: "File management", included: true },
    ],
  },
  {
    name: "Professional",
    blurb: "For growing IT companies that bill clients.",
    monthly: 98.99,
    highlight: true,
    cta: { label: "Get Started", href: "/company-register?plan=professional" },
    features: [
      { label: "Up to 25 users", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Unlimited clients", included: true },
      { label: "Invoice system & payment tracking", included: true },
      { label: "Support tickets", included: true },
      { label: "File management", included: true },
      { label: "Team management", included: true },
      { label: "White-label & custom domain", included: false },
    ],
  },
  {
    name: "Enterprise",
    blurb: "For agencies and software houses.",
    monthly: null,
    cta: { label: "Contact Sales", href: "/register" },
    features: [
      { label: "Unlimited users", included: true },
      { label: "White-label dashboard", included: true },
      { label: "Custom domain", included: true },
      { label: "AI project reports", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Priority support", included: true },
      { label: "Dedicated onboarding", included: true },
      { label: "SLA & SSO", included: true },
    ],
  },
];

const YEARLY_MONTHS = 10; // pay 10, get 12 (2 months free)

export default function PricingTables() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!yearly ? "text-white font-semibold" : "text-gray-400"}`}>Monthly</span>
        <button
          onClick={() => setYearly((y) => !y)}
          className="relative w-14 h-7 rounded-full transition-colors"
          style={{ background: yearly ? "#7c3aed" : "rgba(255,255,255,0.15)" }}
          aria-label="Toggle yearly billing"
        >
          <span
            className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: yearly ? "calc(100% - 1.5rem)" : "0.25rem" }}
          />
        </button>
        <span className={`text-sm ${yearly ? "text-white font-semibold" : "text-gray-400"}`}>
          Yearly <span className="text-aura-cyan">· save 2 months</span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((p) => {
          const raw = p.monthly == null ? null : yearly ? (p.monthly * YEARLY_MONTHS) / 12 : p.monthly;
          const price = raw == null ? null : Number.isInteger(raw) ? String(raw) : raw.toFixed(2);
          return (
            <div
              key={p.name}
              className={`glass-card p-7 flex flex-col relative ${p.highlight ? "ring-2 ring-aura-purple/60" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(120deg,#7c3aed,#06b6d4)" }}>
                  <Sparkles size={12} /> Most Popular
                </span>
              )}
              <h3 className="text-xl font-black text-white">{p.name}</h3>
              <p className="text-sm text-gray-400 mt-1 min-h-[40px]">{p.blurb}</p>

              <div className="mt-5 mb-6">
                {price == null ? (
                  <div className="text-3xl font-black text-white">Custom</div>
                ) : (
                  <div className="flex items-end gap-1.5">
                    <span className="text-4xl font-black gradient-text">${price}</span>
                    <span className="text-sm text-gray-400 mb-1.5">/ user-month</span>
                  </div>
                )}
                {raw != null && yearly && (
                  <p className="text-xs text-aura-cyan mt-1">Billed annually (${(raw * 12).toFixed(2)}/yr)</p>
                )}
              </div>

              <Link
                href={p.cta.href}
                className={`${p.highlight ? "btn-primary" : "btn-secondary"} w-full justify-center mb-6`}
              >
                {p.cta.label} <ArrowRight size={16} />
              </Link>

              <ul className="space-y-2.5 mt-auto">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <X size={16} className="text-gray-600 mt-0.5 shrink-0" />
                    )}
                    <span className={f.included ? "text-gray-300" : "text-gray-600"}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500 mt-10">
        All plans include a 14-day free trial. No credit card required to start. Prices in USD.
      </p>
    </div>
  );
}
