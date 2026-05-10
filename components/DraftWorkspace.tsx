"use client";

import { useDeferredValue, useState, useTransition } from "react";

import { CharCounter } from "@/components/CharCounter";
import { CopyButton } from "@/components/CopyButton";
import { Editor } from "@/components/Editor";

type DraftWorkspaceProps = {
  initialDraft?: string;
};

export function DraftWorkspace({ initialDraft = "" }: DraftWorkspaceProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredGenerated = useDeferredValue(generated);
  const draftDescriptionId = "draft-workspace-description";
  const generatedHeadingId = "generated-output-heading";
  const generatedDescriptionId = "generated-output-description";
  const generateStatusId = "generate-status";

  async function runGeneration() {
    setError(null);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draft }),
    });

    const data = (await response.json()) as { error?: string; generated?: string };

    if (!response.ok || !data.generated) {
      setError(data.error || "Could not generate a post right now.");
      return;
    }

    setGenerated(data.generated);
  }

  function handleGenerate() {
    startTransition(() => {
      void runGeneration();
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-2 xl:gap-8">
      <div className="space-y-5 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_20px_70px_-45px_color-mix(in_oklch,var(--color-accent)_18%,transparent)]">
        <div className="space-y-2">
          <p id="draft-workspace-heading" className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
            Rough draft
          </p>
          <h2 className="font-display text-4xl leading-none text-(--color-foreground)">
            Start messy.
          </h2>
          <p id={draftDescriptionId} className="max-w-md text-sm leading-6 text-(--color-muted)">
            Drop the idea as notes, fragments, or a barely shaped story. TrueTone will refine the structure, not flatten your voice.
          </p>
        </div>

        <label htmlFor="draft-input" className="sr-only">
          Rough draft input
        </label>
        <textarea
          id="draft-input"
          aria-labelledby="draft-workspace-heading"
          aria-describedby={`${draftDescriptionId} ${generateStatusId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={12}
          className="min-h-64 w-full rounded-[1.75rem] border border-(--color-border) bg-(--color-page) px-5 py-4 text-base leading-7 text-(--color-foreground) outline-none transition focus:border-(--color-accent) sm:min-h-80 sm:py-5"
          placeholder="Example: I keep seeing students mimic startup-founder content on LinkedIn. The result looks polished, but nobody remembers it because the voice never belonged to them in the first place."
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || draft.trim().length < 20}
            aria-describedby={generateStatusId}
            className="min-h-11 rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Generating post..." : "Generate post"}
          </button>
          <p className="text-sm text-(--color-muted)">Aim for one real idea, one strong point of view, one next step.</p>
        </div>

        <p id={generateStatusId} aria-live="polite" className="text-sm text-(--color-muted)">
          {isPending
            ? "TrueTone is generating a refined draft."
            : error
              ? error
              : "Drafts stay editable after generation so you can keep your phrasing intact."}
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-4xl border border-(--color-border) bg-(--color-page) p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Refined output
            </p>
            <h2 id={generatedHeadingId} className="font-display text-3xl leading-none text-(--color-foreground) sm:text-4xl">
              Edit the final pass.
            </h2>
            <p id={generatedDescriptionId} className="mt-2 max-w-md text-sm leading-6 text-(--color-muted)">
              Review the generated draft, tighten the hook, and remove anything that sounds less like you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CharCounter count={generated.length} />
            <CopyButton text={generated} />
          </div>
        </div>

        <Editor
          value={deferredGenerated}
          onChange={setGenerated}
          labelledBy={generatedHeadingId}
          describedBy={generatedDescriptionId}
        />
      </div>
    </section>
  );
}