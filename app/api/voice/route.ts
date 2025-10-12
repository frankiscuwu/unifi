import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing Gemini API key");
  return key;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("audio");

    console.log("FILE", file)

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing 'audio' file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "audio/webm";

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using gemini 2.5

    const textPrompt =
      "You are an AI DJ. Transcribe the user's audio verbatim as plain text only. Do not add commentary or labels. If unintelligible, return your best guess of what was said.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: textPrompt },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
    });

    const transcript = (result.response.text() || "").trim();
    const djMessage = generateDjMessage(transcript);

    // Return a simple, easily parsed schema
    // { transcript: string, djMessage: string }
    return NextResponse.json({ transcript, djMessage });
  } catch (err: any) {
    console.error("/api/voice error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

function generateDjMessage(transcript: string): string {
  const t = (transcript || "").toLowerCase();

  const actionPhrases = [
    "on it—queueing that up.",
    "got it—lining that up now.",
    "done—adding to the queue.",
  ];
  const recommendPhrases = [
    "got you—I'll pull a few recs you'll like.",
    "give me a sec—curating some similar tracks.",
    "I’ll spin up a few suggestions.",
  ];
  const neutralPhrases = [
    "that's a great pick.",
    "nice taste—that’s a vibe.",
    "love that energy.",
    "solid choice—let’s keep it rolling.",
    "clean selection—sounds good.",
  ];

  if (/(play|queue|add|put on|spin)/.test(t)) {
    return randomPick(actionPhrases);
  }
  if (/(recommend|suggest|something like|similar to|what should i listen)/.test(t)) {
    return randomPick(recommendPhrases);
  }
  return randomPick(neutralPhrases);
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
