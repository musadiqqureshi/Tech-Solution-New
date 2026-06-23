import { NextResponse } from "next/server";
import { siteSystemPrompt } from "@/lib/aiKnowledge";

const BASE = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
const KEY = process.env.AI_API_KEY || "";
const PRIMARY = process.env.AI_MODEL || "cohere/north-mini-code:free";
const FALLBACKS = Array.from(new Set([
  PRIMARY,
  "cohere/north-mini-code:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
]));

interface Msg { role: "user" | "assistant"; content: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  if (!KEY) return NextResponse.json({ error: "AI is not configured." }, { status: 503 });

  let messages: Msg[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!messages.length) return NextResponse.json({ error: "No messages." }, { status: 400 });

  const payloadBase = {
    messages: [{ role: "system", content: siteSystemPrompt() }, ...messages],
    temperature: 0.4,
    max_tokens: 3000, // reasoning models spend tokens thinking before content
    reasoning: { effort: "low" }, // keep replies fast (ignored by non-reasoning models)
  };

  for (const model of FALLBACKS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${BASE}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tech-solutions.site",
            "X-Title": "Tech Solutions AI",
          },
          body: JSON.stringify({ model, ...payloadBase }),
        });
        if (res.status === 429) {
          // Free models are rate-limited upstream — retry once, then next model.
          if (attempt === 0) { await sleep(1200); continue; }
          break;
        }
        if (!res.ok) break;
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();
        if (reply) return NextResponse.json({ reply });
        break;
      } catch {
        break;
      }
    }
  }
  return NextResponse.json({ error: "The assistant is busy right now. Please try again." }, { status: 502 });
}
