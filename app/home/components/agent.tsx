"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { postAnalyzeTopTracks } from "../lib/ai_textprompts";

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
  if (/(recommend|suggest|something like|similar to|what should i listen|what should i play)/.test(t)) {
    return randomPick(recommendPhrases);
  }
  return randomPick(neutralPhrases);
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Agent() {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Hello! What kind of songs do you want to hear?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { role: "user", content: input },
      { role: "agent", content: "Thinking..." },
    ];
    setMessages(newMessages);
    const userText = input;
    setInput("");

    // Replace placeholder with a concise DJ-style response (heuristic)
    const reply = generateDjMessage(userText);
    setMessages((prev) => prev.slice(0, -1).concat({ role: "agent", content: reply }));

    try {
      // Keep analyzeTopTracks: send the user's text to your backend
      try {
        const { uris } = await postAnalyzeTopTracks(userText);
        console.log("Agent analyzeTopTracks URIs:", uris);
      } catch (err) {
        console.error("Agent ai_textprompts error:", err);
      }
    } catch (e: any) {
      console.error("Gemini error:", e);    } 
  };


  return (
    <div className="relative flex flex-col h-full w-full max-w-xl mx-auto bg-neutral-900/80 backdrop-blur text-white rounded-xl shadow-xl overflow-hidden ring-1 ring-neutral-800">
      {/* Header */}
      <div className="justify-end px-3 py-2 border-b border-neutral-800/80 flex items-center">
        <h2 className="font-medium mr-2 text-xs tracking-wide uppercase text-neutral-300 ">AI DJ</h2>
        <span className="text-[10px] text-neutral-500">Gemini 2.5</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-2.5 py-1.5 rounded-2xl text-[12px] leading-relaxed ${
                m.role === "user"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-neutral-800/80 text-gray-200 ring-1 ring-neutral-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 border-t border-neutral-800/80 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a prompt..."
          className="flex-1 bg-neutral-800/80 text-white rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 transition rounded-md px-3 py-1.5 text-xs font-medium"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
