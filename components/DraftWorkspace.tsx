"use client";

import { useDeferredValue, useState } from "react";

import { CharCounter } from "@/components/CharCounter";
import { CopyButton } from "@/components/CopyButton";
import { Editor } from "@/components/Editor";
import { MAX_REVISION_PROMPTS } from "@/lib/post-drafts";

type DraftWorkspaceProps = {
  initialDraft?: string;
  isAuthenticated?: boolean;
  hasContext?: boolean;
};

export function DraftWorkspace({ initialDraft = "", isAuthenticated = true, hasContext = true }: DraftWorkspaceProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [postDraftId, setPostDraftId] = useState<string | null>(null);
  const [remainingPrompts, setRemainingPrompts] = useState(MAX_REVISION_PROMPTS);
  const [revisionInstruction, setRevisionInstruction] = useState("");
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const deferredGenerated = useDeferredValue(generated);
  const draftDescriptionId = "draft-workspace-description";
  const generatedHeadingId = "generated-output-heading";
  const generatedDescriptionId = "generated-output-description";
  const generateStatusId = "generate-status";
  const reviseStatusId = "revise-status";
  const revisionInstructionId = "revision-instruction";
  const hasGeneratedPost = generated.trim().length >= 20;
  const canGenerate = isAuthenticated && hasContext && draft.trim().length >= 20 && !isGenerating && !isRevising;
  const canRevise =
    isAuthenticated &&
    hasContext &&
    hasGeneratedPost &&
    Boolean(postDraftId) &&
    revisionInstruction.trim().length >= 5 &&
    remainingPrompts > 0 &&
    !isGenerating &&
    !isRevising;

  async function runGeneration() {
    if (!isAuthenticated) {
      setError("Sign in to generate a post.");
      return;
    }

    if (!hasContext) {
      setError("Complete your tone profile before generating a post.");
      return;
    }

    setError(null);
    setRevisionError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft }),
      });

      const data = (await response.json()) as {
        error?: string;
        generated?: string;
        postDraftId?: string;
        remainingPrompts?: number;
      };

      if (!response.ok || !data.generated || !data.postDraftId) {
        setError(data.error || "Could not generate a post right now.");
        return;
      }

      setGenerated(data.generated);
      setPostDraftId(data.postDraftId);
      setRemainingPrompts(data.remainingPrompts ?? MAX_REVISION_PROMPTS);
      setRevisionInstruction("");
      setRevisionError(null);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleGenerate() {
    void runGeneration();
  }

  async function runRevision() {
    if (!isAuthenticated) {
      setRevisionError("Sign in to revise a generated post.");
      return;
    }

    if (!hasContext) {
      setRevisionError("Complete your tone profile before revising a post.");
      return;
    }

    if (!postDraftId) {
      setRevisionError("Generate a post before asking TrueTone to revise it.");
      return;
    }

    setRevisionError(null);
    setIsRevising(true);

    try {
      const response = await fetch("/api/generate/revise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postDraftId,
          editedPost: generated,
          instruction: revisionInstruction,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        generated?: string;
        remainingPrompts?: number;
      };

      if (!response.ok || !data.generated) {
        if (typeof data.remainingPrompts === "number") {
          setRemainingPrompts(data.remainingPrompts);
        }

        setRevisionError(data.error || "Could not revise the post right now.");
        return;
      }

      setGenerated(data.generated);
      setRemainingPrompts(data.remainingPrompts ?? remainingPrompts);
      setRevisionInstruction("");
    } finally {
      setIsRevising(false);
    }
  }

  function handleRevise() {
    void runRevision();
  }

  return (
    <section className="grid gap-4 lg:gap-5">
      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch lg:gap-5">
        <div className="flex min-h-112 flex-col gap-4 rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_20px_70px_-45px_color-mix(in_oklch,var(--color-accent)_18%,transparent)] sm:p-6">
          <div className="space-y-1.5">
            <p id="draft-workspace-heading" className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Rough draft
            </p>
            <h2 className="font-display text-[2.8rem] leading-[0.92] text-(--color-foreground)">
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
            className="scrollbar-hidden min-h-72 flex-1 resize-none overflow-y-auto rounded-[1.9rem] border border-(--color-border) bg-(--color-page) px-5 py-4 text-base leading-8 text-(--color-foreground) outline-none shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-surface)_70%,transparent)] transition focus:border-(--color-accent) sm:min-h-88 sm:px-6 sm:py-5 lg:min-h-0"
            placeholder="Example: I keep seeing students mimic startup-founder content on LinkedIn. The result looks polished, but nobody remembers it because the voice never belonged to them in the first place."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-describedby={generateStatusId}
              className="min-h-11 rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!isAuthenticated
                ? "Sign in to generate"
                : !hasContext
                  ? "Complete tone profile first"
                  : isGenerating
                    ? "Generating post..."
                    : "Generate post"}
            </button>
            <p className="max-w-sm text-sm leading-6 text-(--color-muted)">Aim for one real idea, one strong point of view, one next step.</p>
          </div>

          <p id={generateStatusId} aria-live="polite" className="text-sm leading-6 text-(--color-muted)">
            {isGenerating
              ? "TrueTone is generating a refined draft."
              : !isAuthenticated
                ? "Sign in to turn this rough draft into a saved generated post."
                : !hasContext
                  ? "Complete your tone profile first so generation has voice, audience, and sample-post context."
              : error
                ? error
                : "Drafts stay editable after generation so you can keep your phrasing intact."}
          </p>
        </div>

        <div className="flex min-h-112 flex-col gap-5 rounded-4xl border border-(--color-border) bg-(--color-page) p-5 sm:p-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Refined output
            </p>
            <h2 id={generatedHeadingId} className="font-display text-[2.65rem] leading-[0.92] text-(--color-foreground)">
              Edit the final pass.
            </h2>
            <p id={generatedDescriptionId} className="max-w-sm text-sm leading-6 text-(--color-muted)">
              Review the generated draft, tighten the hook, and remove anything that sounds less like you.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-(--color-border) bg-(--color-surface) px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--color-muted)">
            {postDraftId ? `${remainingPrompts} prompts left` : `${MAX_REVISION_PROMPTS} prompts when generated`}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <CharCounter count={generated.length} />
            <CopyButton text={generated} />
          </div>

          <p className="text-sm leading-6 text-(--color-muted)">
            Generated copy opens below. Scroll inside the editor, keep the strongest hook, and trim anything that feels generic.
          </p>
        </div>

        <div className="flex min-h-112 flex-col gap-4 rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Prompt changes
            </p>
            <h3 className="font-display text-[2.3rem] leading-[0.94] text-(--color-foreground)">
              Ask for one more pass.
            </h3>
            <p className="max-w-sm text-sm leading-6 text-(--color-muted)">
              Tell TrueTone what to change in the edited post. Each generated post gets {MAX_REVISION_PROMPTS} revision prompts.
            </p>
          </div>

          <label htmlFor={revisionInstructionId} className="sr-only">
            Revision instruction
          </label>
          <textarea
            id={revisionInstructionId}
            value={revisionInstruction}
            onChange={(event) => setRevisionInstruction(event.target.value)}
            rows={5}
            disabled={!postDraftId || isGenerating || isRevising || remainingPrompts <= 0}
            aria-describedby={reviseStatusId}
            className="scrollbar-hidden min-h-32 flex-1 resize-none overflow-y-auto rounded-[1.7rem] border border-(--color-border) bg-(--color-page) px-5 py-4 text-base leading-7 text-(--color-foreground) outline-none transition focus:border-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-0"
            placeholder="Example: Make the hook sharper, cut one paragraph, and end with a more direct question."
          />

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleRevise}
              disabled={!canRevise}
              aria-describedby={reviseStatusId}
              className="min-h-11 rounded-full border border-(--color-border) bg-(--color-page) px-6 py-3 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!isAuthenticated
                ? "Sign in to revise"
                : !hasContext
                  ? "Finish tone profile first"
                  : isRevising
                    ? "Applying changes..."
                    : "Revise this post"}
            </button>
            <p className="text-sm leading-6 text-(--color-muted)">
              {postDraftId
                ? `${remainingPrompts} of ${MAX_REVISION_PROMPTS} revision prompts remaining for this post.`
                : `Generate a post first to unlock ${MAX_REVISION_PROMPTS} revision prompts.`}
            </p>
          </div>

          <p id={reviseStatusId} aria-live="polite" className="text-sm leading-6 text-(--color-muted)">
            {isRevising
              ? "TrueTone is revising your edited post."
              : !isAuthenticated
                ? "Revision prompts unlock after sign-in and generation."
                : !hasContext
                  ? "Revision prompts need a saved tone profile before generation starts."
              : revisionError
                ? revisionError
                : postDraftId && remainingPrompts <= 0
                  ? "No revision prompts left for this post. Keep editing manually or generate a new post."
                  : "Manual edits always stay available, even after the AI prompt limit runs out."}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-4xl border border-(--color-border) bg-(--color-page) p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Generated post
            </p>
            <p className="text-sm leading-6 text-(--color-muted)">
              Scroll the draft below, edit directly, then copy the final version when it is ready.
            </p>
          </div>
        </div>

        <Editor
          value={deferredGenerated}
          onChange={setGenerated}
          labelledBy={generatedHeadingId}
          describedBy={generatedDescriptionId}
          wrapperClassName="h-[20rem] sm:h-[22rem] lg:h-[24rem] xl:h-[28rem]"
          editorClassName="scrollbar-hidden h-full min-h-0 overflow-y-auto"
        />
      </div>
    </section>
  );
}