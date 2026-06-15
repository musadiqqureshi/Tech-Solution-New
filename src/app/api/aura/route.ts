import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Aura, the AI assistant for Tech Solutions Pakistan, a premium software & AI agency led by CEO Muhammad Mussaddiq Ahmed Qureshi.
You help the team with: lead qualification, requirement gathering, budget estimation, drafting proposals and client replies, project summaries, and service recommendations.
Services offered: Software Development, Web Development, Mobile Applications, Content & Research Writing, AI Automation, and AI Agents & Chatbots.
Be concise, professional, and practical. When drafting client-facing text, keep a confident premium tone.`;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "not_configured", message: "Gemini API key is not configured on the server." },
      { status: 503 }
    );
  }

  let messages: ChatMsg[] = [];
  try {
    ({ messages } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const contents = (messages ?? []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "gemini_error", detail }, { status: 502 });
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't generate a response. Please try again.";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: "network_error", message: e instanceof Error ? e.message : "Request failed" },
      { status: 502 }
    );
  }
}
