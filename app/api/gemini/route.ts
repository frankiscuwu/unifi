import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error("Missing Gemini API key (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)");
  return key;
}

const MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

const DJ_SYSTEM_PROMPT = `
You are UniFi DJ — a concise, upbeat AI music DJ.
Goals:
- Help with music discovery, queues, and playback context.
- Be brief, natural, and fun. 1–3 sentences typically.
- If a specific action is implied (play, add to queue), acknowledge it and ask for missing details.
- Prefer popular references but respect user taste. Provide 2–4 specific song/artist recs when asked.
- If unsure, ask a short clarifying question.
Avoid overusing emojis. No code blocks. Keep the vibe friendly.
`;

type Msg = { role: "user" | "agent"; content: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    const userOverridePrompt: string | undefined = body?.djPrompt;

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

    // Build a compact transcript for context
    const history = messages
      .slice(-12) // last 12 turns for brevity
      .map((m) => `${m.role === "user" ? "User" : "DJ"}: ${m.content}`)
      .join("\n");

    const prompt = `${userOverridePrompt || DJ_SYSTEM_PROMPT}\n\nConversation so far:\n${history}\n\nRespond as UniFi DJ:`;

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const text = result.response.text();

    return NextResponse.json({ ok: true, text });
  } catch (err: any) {
    console.error("/api/gemini error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
