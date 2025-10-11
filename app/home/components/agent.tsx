import { useState } from "react";

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
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-neutral-900 text-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="font-semibold text-lg">AI Agent</h2>
        <span className="text-xs text-gray-400">Powered by GPT-5</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-neutral-800 text-gray-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-500 transition rounded-lg px-3 py-2 text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
