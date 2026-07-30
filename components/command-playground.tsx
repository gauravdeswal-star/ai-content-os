"use client";

import { useState, useRef, useEffect } from "react";

type Command = {
  name: string;
  label: string;
  icon: string;
  placeholder: string;
  example: string;
};

const COMMANDS: Command[] = [
  {
    name: "script",
    label: "/script",
    icon: "📝",
    placeholder: "e.g. Top 10 AI Tools for 2026",
    example: "Top 10 AI Tools for 2026",
  },
  {
    name: "caption",
    label: "/caption",
    icon: "💬",
    placeholder: "e.g. New product launch announcement",
    example: "New product launch announcement",
  },
  {
    name: "hashtags",
    label: "/hashtags",
    icon: "#️⃣",
    placeholder: "e.g. digital marketing tips",
    example: "digital marketing tips",
  },
  {
    name: "carousel",
    label: "/carousel",
    icon: "🎠",
    placeholder: "e.g. Social media trends 2026",
    example: "Social media trends 2026",
  },
  {
    name: "image",
    label: "/image",
    icon: "🎨",
    placeholder: "e.g. A futuristic cityscape at sunset",
    example: "A futuristic cityscape at sunset",
  },
  {
    name: "video",
    label: "/video",
    icon: "🎬",
    placeholder: "e.g. Product launch trailer",
    example: "Product launch trailer",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export function CommandPlayground() {
  const [selected, setSelected] = useState(COMMANDS[0]!);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Welcome to AI Content OS! Select a command, type a topic, and hit Generate to see AI content in action.",
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator animation
  useEffect(() => {
    if (!loading) {
      setTypingDots(false);
      return;
    }
    setTypingDots(true);
  }, [loading]);

  async function handleGenerate() {
    if (!input.trim() || loading) return;

    const topic = input.trim();
    setInput("");

    const userMsg: Message = {
      role: "user",
      content: `/${selected.name}\nTopic: ${topic}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let endpoint = "/api/generate";
      let body: Record<string, unknown> = { prompt: topic };

      if (selected.name === "image") {
        endpoint = "/api/image";
        body = { prompt: topic, mode: "prompt" };
      } else if (selected.name === "hashtags") {
        endpoint = "/api/hashtags";
        body = { topic };
      } else if (selected.name === "caption") {
        endpoint = "/api/caption";
        body = { topic };
      } else if (selected.name === "carousel") {
        endpoint = "/api/carousel";
        body = { topic };
      } else if (selected.name === "video") {
        endpoint = "/api/video";
        body = { topic };
      } else {
        endpoint = "/api/script";
        body = { topic };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: result.success
          ? result.data?.content || result.data?.text || result.data?.prompt || result.message || "✅ Generated successfully!"
          : `❌ ${result.error?.message || result.message || "Generation failed"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.name === "AbortError"
            ? "⏱️ Request timed out. The AI model may be loading — try again in a moment."
            : `❌ ${err.message}`
          : "❌ An unexpected error occurred";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Command selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.name}
            onClick={() => setSelected(cmd)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              selected.name === cmd.name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>{cmd.icon}</span>
            <span>{cmd.label}</span>
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm">
            {selected.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{selected.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {selected.name === "image" ? "Generates optimized prompt" : selected.name === "hashtags" ? "Smart hashtag suggestions" : `Generates ${selected.name} content`}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[11px] text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[320px] space-y-3 overflow-y-auto p-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typingDots && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-muted-foreground/40"
                    style={{ animation: `typing 1.4s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selected.placeholder}
              disabled={loading}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
