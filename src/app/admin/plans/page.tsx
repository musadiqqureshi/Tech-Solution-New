"use client";

import { Check } from "lucide-react";
import { PageHeader } from "@/components/app/ui";

const PLANS = [
  { name: "Starter", price: "$14.99", blurb: "Small IT teams", features: ["5 users", "10 projects", "10 clients", "Task management", "Client portal", "Invoicing", "Support tickets", "File management"] },
  { name: "Professional", price: "$98.99", blurb: "Growing IT companies", features: ["25 users", "Unlimited projects", "Unlimited clients", "Invoice system", "Support tickets", "File management", "Team management"] },
  { name: "Enterprise", price: "Custom", blurb: "Agencies & software houses", features: ["Unlimited users", "White-label dashboard", "Custom domain", "AI project reports", "Advanced analytics", "Priority support", "SLA & SSO"] },
];

export default function AdminPlans() {
  return (
    <>
      <PageHeader title="Plans" subtitle="Subscription tiers offered to companies" />
      <div className="glass-card p-4 mb-6 border border-amber-500/30">
        <p className="text-sm text-gray-300">
          Pricing is presented on the public <span className="text-aura-cyan">/pricing</span> page. Live Stripe
          billing isn’t connected yet — set a company’s plan & status manually under{" "}
          <span className="text-aura-cyan">Companies</span> until billing goes live.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((p) => (
          <div key={p.name} className="glass-card p-6">
            <h3 className="text-lg font-black text-white">{p.name}</h3>
            <p className="text-xs text-gray-400">{p.blurb}</p>
            <p className="text-3xl font-black gradient-text mt-3 mb-4">{p.price}<span className="text-sm text-gray-400 font-normal"> {p.price !== "Custom" ? "/ user-mo" : ""}</span></p>
            <ul className="space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-300"><Check size={15} className="text-emerald-400 shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
