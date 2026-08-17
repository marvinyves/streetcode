"use client";

import { useRef, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type Status = "idle" | "loading" | "streaming" | "error" | "rate-limited";

export function AskBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).askBar;
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || status === "loading" || status === "streaming") return;

    setStatus("loading");
    setAnswer("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, locale }),
      });

      if (res.status === 429) {
        setStatus("rate-limited");
        return;
      }
      if (!res.ok || !res.body) {
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnswer(full);
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6">
      <div
        className={`pointer-events-auto w-full max-w-xl rounded-2xl border border-border bg-surface/95 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 ease-out ${
          open ? "p-4" : "p-1.5"
        }`}
      >
        {open && (answer || status !== "idle") && (
          <div className="mb-3 max-h-64 overflow-y-auto rounded-xl bg-accent-soft px-4 py-3 text-sm leading-relaxed">
            {status === "loading" && (
              <span className="text-muted">{dict.thinking}</span>
            )}
            {status === "rate-limited" && (
              <span className="text-muted">{dict.rateLimited}</span>
            )}
            {status === "error" && (
              <span className="text-muted">{dict.error}</span>
            )}
            {answer && <span className="whitespace-pre-wrap">{answer}</span>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span
            className="ml-2 h-2 w-2 shrink-0 rounded-full bg-accent"
            aria-hidden
          />
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={dict.placeholder}
            maxLength={280}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "streaming"}
            className="shrink-0 rounded-xl bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {dict.send}
          </button>
        </form>
        {open && (
          <p className="mt-2 px-2 text-xs text-muted">{dict.disclaimer}</p>
        )}
      </div>
    </div>
  );
}
