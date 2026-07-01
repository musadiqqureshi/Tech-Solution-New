"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "What services does Tech Solutions offer?", a: "Enterprise software development, web & mobile apps, big data engineering, AI automation, AI agents & chatbots, and content & research writing — end to end, from idea to production." },
  { q: "How do projects get started?", a: "Register and place an order describing your project (with requirement files and a deadline). After we review and approve it, you pay a 30% advance and we begin — the remaining 70% is due on final delivery." },
  { q: "How do I track my project and get deliverables?", a: "Your client portal shows live status, lets you download deliverables, request follow-ups or revisions, chat with the team, book meetings, and download invoices." },
  { q: "Do you offer a SaaS platform for IT companies?", a: "Yes. IT companies get their own private workspace to manage clients, projects, tasks, teams, invoices and tickets. Plans start at $14.99/user-month, billed in PKR by bank transfer — see the Pricing page." },
  { q: "Do you run internships?", a: "Yes — a structured internship program with real projects and senior mentorship, and a path to becoming a paid expert. Apply on the Internship page." },
  { q: "Which industries have you worked in?", a: "400+ projects across 12+ industries including Healthcare, Aviation, Finance, Hospitality, and Logistics." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section id="faq" className="relative py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="section-tag justify-center"><span className="w-8 h-px bg-cyan-500" /> FAQ <span className="w-8 h-px bg-cyan-500" /></div>
          <h2 className="section-heading text-white">Questions, <span className="gradient-text">answered</span></h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="glass-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="text-white font-semibold">{f.q}</span>
                  <ChevronDown size={18} className={`text-aura-cyan shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
