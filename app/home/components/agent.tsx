"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export default function Agent() {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { role: "user", content: input },
      { role: "agent", content: "Thinking..." },
    ];
    setMessages(newMessages);
    setInput("");

    // Simulate AI response (replace this with API call later)
    setTimeout(() => {
      setMessages((prev) =>
        prev
          .slice(0, -1)
          .concat({ role: "agent", content: "Here’s a thoughtful response 🤖" })
      );
    }, 800);
  };


  return (
    <div className="relative flex flex-col h-full w-full max-w-xl mx-auto bg-neutral-900/80 backdrop-blur text-white rounded-xl shadow-xl overflow-hidden ring-1 ring-neutral-800">
      {/* Header */}
      <div className="px-3 py-2 border-b border-neutral-800/80 flex items-center justify-between">
        <h2 className="font-medium text-xs tracking-wide uppercase text-neutral-300">AI Agent</h2>
        <span className="text-[10px] text-neutral-500">Gemini-ready</span>
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
          className="bg-green-600 hover:bg-green-500 transition rounded-md px-3 py-1.5 text-xs font-medium"
        >
          Send
        </button>
      </div>

      {/* Mic removed: now a separate component (Microphone) */}
    </div>
  );
}
