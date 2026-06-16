import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingTables from "@/components/pricing/PricingTables";
import { COMPANY } from "@/lib/constants";

const url = `https://${COMPANY.domain}/pricing`;

export const metadata: Metadata = {
  title: "Pricing — SaaS Plans for IT Companies",
  description:
    "Simple monthly and yearly pricing for the Tech Solutions SaaS platform. Manage clients, projects, tasks, teams, invoices, files, and support tickets. Starter, Professional, and Enterprise plans with a 14-day free trial.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Pricing — Tech Solutions SaaS Platform",
    description:
      "Monthly & yearly plans for IT companies: clients, projects, tasks, teams, invoices, and support tickets. Start free.",
  },
};

const FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes — every plan includes a 14-day free trial. No credit card is required to get started.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time and we prorate the difference automatically.",
  },
  {
    q: "Do you offer monthly and yearly billing?",
    a: "Both. Yearly billing gives you two months free compared to paying monthly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards via Stripe. Enterprise customers can pay by invoice.",
  },
];

export default function PricingPage() {
  // FAQ structured data improves the chance of rich results in Google.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />
      <main className="bg-aura-mesh min-h-screen pt-28 pb-20 px-4 sm:px-6">
        <section className="max-w-3xl mx-auto text-center mb-14">
          <span className="section-tag justify-center">— Pricing</span>
          <h1 className="section-heading text-white">
            Run your IT company on <span className="gradient-text">one platform</span>
          </h1>
          <p className="text-gray-400 mt-4 text-base sm:text-lg">
            Clients, projects, tasks, teams, invoices, files, and support tickets — in a single
            workspace. Start free, upgrade as you grow.
          </p>
        </section>

        <PricingTables />

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-black text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="glass-card p-5">
                <h3 className="text-white font-semibold">{f.q}</h3>
                <p className="text-sm text-gray-400 mt-1.5">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
