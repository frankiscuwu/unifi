import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "agent", content: "Hey there! 👋 How’s your day going?" },
    { id: 2, sender: "user", content: "Pretty good! Just listening to some music 🎶" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate agent reply (replace with your own backend later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "agent", content: "Nice! What song are you listening to?" },
      ]);
    }, 800);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-neutral-900 text-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Chat</h2>
        <span className="text-xs text-gray-400">Now online 🟢</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-green-600 text-white"
                  : "bg-neutral-800 text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
