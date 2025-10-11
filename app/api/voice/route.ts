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

    const systemPrompt = form.get("prompt") as string | null;
    const textPrompt =
      systemPrompt + "Transcribe the user's audio and send it";

    const result = await model.generateContent({ contents: [ { role: "user", parts: [ { text: textPrompt }, { inlineData: { mimeType, data: base64 } }, ], }, ], });

    const text = result.response.text();
    return NextResponse.json({ ok: true, text });
  } catch (err: any) {
    console.error("/api/voice error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
