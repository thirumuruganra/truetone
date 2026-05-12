"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
};

export function CopyButton({ text }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text.trim()}
      className="min-h-11 rounded-full border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-foreground) transition hover:bg-(--color-surface-strong) disabled:cursor-not-allowed disabled:opacity-50"
    >
      {status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy post"}
    </button>
  );
}