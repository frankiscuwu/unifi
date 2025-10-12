import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function getApiKey() {
  const key = process.env.JODI_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error("Missing Gemini API key (JODI_GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)");
  return key;
}

const MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

// Allowed emotions — keep this list in sync with the frontend `EMOTION_COLORS` keys.
const ALLOWED_EMOTIONS = [
  "admiration",
  "amusement",
  "anger",
  "annoyance",
  "approval",
  "caring",
  "curiosity",
  "desire",
  "disappointment",
  "disapproval",
  "disgust",
  "embarrassment",
  "excitement",
  "fear",
  "gratitude",
  "grief",
  "joy",
  "love",
  "nervousness",
  "optimism",
  "pride",
  "realization",
  "relief",
  "remorse",
  "sadness",
  "surprise",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, artist, spotifyId } = body || {};

    if (!name || !artist) {
      return NextResponse.json({ ok: false, error: "Missing name or artist" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

    const prompt = `You are UniFi DJ. Given a song title and artist, choose exactly FOUR distinct emotions from the following allowed list: ${ALLOWED_EMOTIONS.join(", ")}. Only respond with a valid JSON array of four emotion strings (e.g. ["joy","nostalgia","surprise","curiosity"]). Do not include any extra text, explanation, or markdown. Song: "${name}" Artist: "${artist}"`;

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const text = result.response.text();

    // Try to extract JSON array from the model output
    let emotions: string[] = [];
    try {
      emotions = JSON.parse(text);
    } catch (e) {
      // Fallback: try to find a bracketed array in the text
      const match = text.match(/\[([^\]]+)\]/);
      if (match) {
        try {
          emotions = JSON.parse(match[0]);
        } catch (e2) {
          // last fallback: split by commas
          const inner = match[1];
          emotions = inner
            .split(/,/) // split
            .map((s) => s.replace(/["'\s]/g, "").trim())
            .filter(Boolean);
        }
      }
    }

    // Validate and trim to 4 items
    emotions = (emotions || []).filter((e) => ALLOWED_EMOTIONS.includes(e)).slice(0, 4);

    // If model failed, pick four random allowed emotions
    if (emotions.length < 4) {
      const shuffled = ALLOWED_EMOTIONS.sort(() => Math.random() - 0.5);
      emotions = Array.from(new Set([...emotions, ...shuffled])).slice(0, 4);
    }

    return NextResponse.json({ ok: true, emotions });
  } catch (err: any) {
    console.error("/api/gemini/colors error", err);
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
