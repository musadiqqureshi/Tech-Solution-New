"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Bot, Send, Loader2, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/data";

const SERVICE_OPTIONS = [
  "Software Development",
  "Web Development",
  "Mobile Applications",
  "AI Automation",
  "AI Agents & Chatbots",
  "Content & Research Writing",
];
const BUDGET_OPTIONS = ["< $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000+"];
const TIMELINE_OPTIONS = ["ASAP", "1–2 Weeks", "1 Month", "Flexible"];

type Step = "intro" | "service" | "budget" | "timeline" | "description" | "contact" | "summary" | "done";

interface Bubble {
  from: "bot" | "user";
  text: string;
}

export default function LeadChatbot({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [lead, setLead] = useState({
    service: "",
    budget: "",
    timeline: "",
    description: "",
    name: "",
    email: "",
  });
  const [messages, setMessages] = useState<Bubble[]>([
    { from: "bot", text: "Hi! I'm Aura 👋 Let's scope your project in under a minute. Ready?" },
  ]);
  const [textInput, setTextInput] = useState("");
  const [contact, setContact] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, step]);

  const push = (b: Bubble) => setMessages((m) => [...m, b]);

  const pick = (field: keyof typeof lead, value: string, next: Step, botPrompt: string) => {
    setLead((l) => ({ ...l, [field]: value }));
    push({ from: "user", text: value });
    setTimeout(() => {
      push({ from: "bot", text: botPrompt });
      setStep(next);
    }, 300);
  };

  const submitDescription = () => {
    if (!textInput.trim()) return;
    setLead((l) => ({ ...l, description: textInput.trim() }));
    push({ from: "user", text: textInput.trim() });
    setTextInput("");
    setTimeout(() => {
      push({ from: "bot", text: "Almost there! How can we reach you?" });
      setStep("contact");
    }, 300);
  };

  const submitContact = () => {
    if (!contact.name.trim() || !/.+@.+\..+/.test(contact.email)) return;
    setLead((l) => ({ ...l, name: contact.name.trim(), email: contact.email.trim() }));
    push({ from: "user", text: `${contact.name} · ${contact.email}` });
    setTimeout(() => {
      push({ from: "bot", text: "Here's your project summary 👇" });
      setStep("summary");
    }, 300);
  };

  const finalize = async () => {
    setSubmitting(true);
    try {
      await submitLead(lead);
      setStep("done");
      push({ from: "bot", text: "🎉 Got it! Our team will reach out shortly. Talk soon!" });
    } catch {
      push({ from: "bot", text: "Hmm, something went wrong. Please try the contact form instead." });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("intro");
    setLead({ service: "", budget: "", timeline: "", description: "", name: "", email: "" });
    setContact({ name: "", email: "" });
    setMessages([{ from: "bot", text: "Hi! I'm Aura 👋 Let's scope your project in under a minute. Ready?" }]);
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full grid place-items-center text-white shadow-lg"
        style={{
          background: "linear-gradient(120deg, #7c3aed, #2563eb 60%, #06b6d4)",
          boxShadow: "0 10px 40px rgba(124,58,237,0.5)",
        }}
        aria-label="Open lead chatbot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[60] w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh] flex flex-col rounded-2xl overflow-hidden glass-card !bg-[#0c0c1f]/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-aura-purple/30 to-aura-cyan/20">
              <div className="w-9 h-9 rounded-full grid place-items-center bg-gradient-to-br from-aura-purple to-aura-cyan">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Aura Assistant</p>
                <p className="text-[11px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.from === "user"
                        ? "bg-gradient-to-br from-aura-purple to-aura-blue text-white rounded-br-sm"
                        : "bg-white/8 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {step === "summary" && (
                <div className="glass-card p-3 text-xs space-y-1.5 text-gray-300">
                  <Row label="Service" value={lead.service} />
                  <Row label="Budget" value={lead.budget} />
                  <Row label="Timeline" value={lead.timeline} />
                  <Row label="Details" value={lead.description} />
                  <Row label="Contact" value={`${lead.name} · ${lead.email}`} />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="border-t border-white/10 p-3">
              {step === "intro" && (
                <button onClick={() => { push({ from: "user", text: "Let's go!" }); setTimeout(() => { push({ from: "bot", text: "Which service do you need?" }); setStep("service"); }, 300); }} className="btn-primary w-full !py-2.5 text-sm">
                  Let’s go!
                </button>
              )}

              {step === "service" && (
                <OptionGrid options={SERVICE_OPTIONS} onPick={(v) => pick("service", v, "budget", "Great choice! What's your budget range?")} />
              )}
              {step === "budget" && (
                <OptionGrid options={BUDGET_OPTIONS} onPick={(v) => pick("budget", v, "timeline", "Noted. What's your ideal timeline?")} />
              )}
              {step === "timeline" && (
                <OptionGrid options={TIMELINE_OPTIONS} onPick={(v) => pick("timeline", v, "description", "Briefly describe your project:")} />
              )}

              {step === "description" && (
                <div className="flex items-end gap-2">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitDescription(); } }}
                    rows={2}
                    placeholder="e.g. A booking platform for my clinic..."
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple resize-none"
                  />
                  <button onClick={submitDescription} className="btn-primary !p-2.5" aria-label="Send">
                    <Send size={16} />
                  </button>
                </div>
              )}

              {step === "contact" && (
                <div className="space-y-2">
                  <input
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple"
                  />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder="Email address"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-aura-purple"
                  />
                  <button onClick={submitContact} className="btn-primary w-full !py-2.5 text-sm">
                    Continue
                  </button>
                </div>
              )}

              {step === "summary" && (
                <button onClick={finalize} disabled={submitting} className="btn-primary w-full !py-2.5 text-sm disabled:opacity-60">
                  {submitting ? (<><Loader2 size={16} className="animate-spin" /> Submitting...</>) : (<><CheckCircle2 size={16} /> Submit Request</>)}
                </button>
              )}

              {step === "done" && (
                <button onClick={reset} className="btn-secondary w-full !py-2.5 text-sm">
                  Start New Request
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function OptionGrid({ options, onPick }: { options: string[]; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onPick(o)}
          className="text-xs px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:border-aura-purple hover:bg-aura-purple/10 transition-colors text-left"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-16 flex-shrink-0">{label}:</span>
      <span className="text-white flex-1">{value}</span>
    </div>
  );
}
