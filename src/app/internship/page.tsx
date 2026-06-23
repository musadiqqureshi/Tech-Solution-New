"use client";

import { useState } from "react";
import { Loader2, GraduationCap, Check, Rocket, Users, Award, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TechSolutionsAI from "@/components/TechSolutionsAI";
import { submitApplication, INTERN_AREAS } from "@/lib/internships";

const PERKS = [
  { icon: BookOpen, title: "Structured curriculum", text: "Guided learning paths and real project work, not busywork." },
  { icon: Users, title: "Mentorship", text: "Pair with senior experts who review your work and feedback." },
  { icon: Award, title: "Certificate", text: "Earn a completion certificate and a performance reference." },
  { icon: Rocket, title: "Path to expert", text: "Top interns are offered paid expert roles on our platform." },
];

export default function InternshipPage() {
  const [f, setF] = useState({ name: "", email: "", phone: "", area: INTERN_AREAS[0], experience: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.name.trim() || !f.email.trim()) return setError("Name and email are required.");
    setSaving(true);
    try { await submitApplication(f); setDone(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not submit your application."); }
    finally { setSaving(false); }
  };

  const input = "mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-aura-purple/50";
  const label = "text-xs font-semibold text-gray-400 uppercase tracking-widest";

  return (
    <>
      <Navbar />
      <main className="bg-aura-mesh min-h-screen pt-28 pb-20 px-4 sm:px-6">
        <section className="max-w-3xl mx-auto text-center mb-12">
          <span className="section-tag justify-center">— Internship Program</span>
          <h1 className="section-heading text-white">Launch your tech career with <span className="gradient-text">Tech Solutions</span></h1>
          <p className="text-gray-400 mt-4 text-base sm:text-lg">
            A structured internship for aspiring developers and designers — real projects, senior mentorship,
            and a clear path to becoming a paid expert on our platform.
          </p>
        </section>

        <section className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PERKS.map((p) => (
            <div key={p.title} className="glass-card p-5">
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 bg-gradient-to-br from-aura-purple/30 to-aura-cyan/20"><p.icon size={20} className="text-aura-cyan" /></div>
              <h3 className="text-white font-bold text-sm">{p.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{p.text}</p>
            </div>
          ))}
        </section>

        <section className="max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-6 flex items-center justify-center gap-2">
            <GraduationCap size={24} className="text-aura-cyan" /> Apply now
          </h2>
          {done ? (
            <div className="glass-card p-10 text-center">
              <Check size={32} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Application received!</h3>
              <p className="text-sm text-gray-400 mt-2">Thanks for applying. Our team will review your application and reach out by email.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="glass-card p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block"><span className={label}>Full name</span><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
                <label className="block"><span className={label}>Email</span><input className={input} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
                <label className="block"><span className={label}>Phone (optional)</span><input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
                <label className="block"><span className={label}>Area of interest</span>
                  <select className={input} value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })}>
                    {INTERN_AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                </label>
              </div>
              <label className="block"><span className={label}>Experience / skills (optional)</span><input className={input} value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} placeholder="e.g. React, Python, portfolio link" /></label>
              <label className="block"><span className={label}>Why do you want to join? (optional)</span><textarea className={input} rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />} Submit Application
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
      <TechSolutionsAI align="left" />
    </>
  );
}
