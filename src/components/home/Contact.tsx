"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { submitContact } from "@/lib/data";

const fields = [
  { icon: MapPin, label: COMPANY.location, color: "#a78bfa" },
  { icon: Mail, label: COMPANY.email, color: "#22d3ee" },
  { icon: Phone, label: COMPANY.phone, color: "#fbbf24" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContact(form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative py-24 overflow-hidden bg-[#080816]">
      <div className="orb w-96 h-96 top-10 right-0 bg-aura-purple" style={{ filter: "blur(140px)", opacity: 0.1 }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="section-tag justify-center">
            <span className="w-8 h-px bg-cyan-500" /> Get In Touch
            <span className="w-8 h-px bg-cyan-500" />
          </div>
          <h2 className="section-heading text-white">
            Let’s Build Something <span className="gradient-text">Great</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-gray-400 leading-relaxed mb-6">
              Have a project in mind? Tell us about it and our team will respond
              within one business day.
            </p>
            {fields.map((f) => (
              <div key={f.label} className="glass-card p-4 flex items-center gap-3">
                <f.icon size={18} style={{ color: f.color }} />
                <span className="text-sm text-gray-300">{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onSubmit={submit}
            className="glass-card p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Your name" value={form.name} onChange={update("name")} required />
              <Input type="email" placeholder="Email address" value={form.email} onChange={update("email")} required />
            </div>
            <Input placeholder="Subject" value={form.subject} onChange={update("subject")} required />
            <textarea
              placeholder="Tell us about your project..."
              value={form.message}
              onChange={update("message")}
              required
              rows={5}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="btn-primary w-full disabled:opacity-60"
            >
              {status === "sending" ? (
                <><Loader2 size={18} className="animate-spin" /> Sending...</>
              ) : status === "sent" ? (
                <><CheckCircle2 size={18} /> Message Sent!</>
              ) : (
                <><Send size={18} /> Send Message</>
              )}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-400 text-center">
                Something went wrong. Please try again.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple transition-colors"
    />
  );
}
