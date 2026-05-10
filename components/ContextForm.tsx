"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type ContextFormValues = {
  identity: string;
  audience: string;
  voiceAdjectives: string;
  phrasesToUse: string;
  phrasesToAvoid: string;
  examplePosts: string[];
};

type ContextFormProps = {
  initialValues?: Partial<ContextFormValues>;
};

const MIN_POST_FIELDS = 2;
const MAX_POST_FIELDS = 5;

function buildInitialState(initialValues?: Partial<ContextFormValues>): ContextFormValues {
  const examplePosts = [...(initialValues?.examplePosts ?? [])];

  while (examplePosts.length < MIN_POST_FIELDS) {
    examplePosts.push("");
  }

  return {
    identity: initialValues?.identity ?? "",
    audience: initialValues?.audience ?? "",
    voiceAdjectives: initialValues?.voiceAdjectives ?? "",
    phrasesToUse: initialValues?.phrasesToUse ?? "",
    phrasesToAvoid: initialValues?.phrasesToAvoid ?? "",
    examplePosts: examplePosts.slice(0, MAX_POST_FIELDS),
  };
}

export function ContextForm({ initialValues }: ContextFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ContextFormValues>(() => buildInitialState(initialValues));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const completedExamples = useMemo(
    () => form.examplePosts.filter((post) => post.trim().length > 0).length,
    [form.examplePosts],
  );

  function updateField<K extends keyof ContextFormValues>(key: K, value: ContextFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateExamplePost(index: number, value: string) {
    const nextPosts = [...form.examplePosts];
    nextPosts[index] = value;
    updateField("examplePosts", nextPosts);
  }

  function addExamplePost() {
    if (form.examplePosts.length >= MAX_POST_FIELDS) {
      return;
    }

    updateField("examplePosts", [...form.examplePosts, ""]);
  }

  async function saveContext() {
    setFeedback(null);

    const payload = {
      ...form,
      examplePosts: form.examplePosts.map((post) => post.trim()).filter(Boolean),
    };

    const response = await fetch("/api/context", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setFeedback(data.error || "Could not save your context.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      void saveContext();
    });
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <label className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
            Identity
          </span>
          <textarea
            value={form.identity}
            onChange={(event) => updateField("identity", event.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-base leading-7 text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
            placeholder="Example: Product marketing strategist helping early-career operators write with more clarity and edge."
          />
        </label>

        <label className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
            Audience
          </span>
          <textarea
            value={form.audience}
            onChange={(event) => updateField("audience", event.target.value)}
            rows={4}
            className="w-full rounded-3xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-base leading-7 text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
            placeholder="Who reads you, what they struggle with, and what kind of shift you want your posts to create."
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-3 lg:col-span-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
            Voice adjectives
          </span>
          <input
            value={form.voiceAdjectives}
            onChange={(event) => updateField("voiceAdjectives", event.target.value)}
            className="w-full rounded-[999px] border border-(--color-border) bg-(--color-surface) px-5 py-4 text-base text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
            placeholder="Warm, clear, grounded, direct"
          />
        </label>

        <label className="space-y-3 lg:col-span-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
            Phrases to use
          </span>
          <input
            value={form.phrasesToUse}
            onChange={(event) => updateField("phrasesToUse", event.target.value)}
            className="w-full rounded-[999px] border border-(--color-border) bg-(--color-surface) px-5 py-4 text-base text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
            placeholder="Signals, useful pattern, hard-earned lesson"
          />
        </label>

        <label className="space-y-3 lg:col-span-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
            Phrases to avoid
          </span>
          <input
            value={form.phrasesToAvoid}
            onChange={(event) => updateField("phrasesToAvoid", event.target.value)}
            className="w-full rounded-[999px] border border-(--color-border) bg-(--color-surface) px-5 py-4 text-base text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
            placeholder="Game-changer, hustle harder, thought leader"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-muted)">
              Example posts
            </p>
            <h3 className="font-display text-3xl leading-none text-(--color-foreground)">
              Add 2 to 5 posts that sound most like you.
            </h3>
          </div>
          <p className="text-sm text-(--color-muted)">{completedExamples} of 5 added</p>
        </div>

        <div className="grid gap-4">
          {form.examplePosts.map((post, index) => (
            <label key={index} className="space-y-2">
              <span className="text-sm font-medium text-(--color-muted)">Post {index + 1}</span>
              <textarea
                value={post}
                onChange={(event) => updateExamplePost(index, event.target.value)}
                rows={5}
                className="w-full rounded-3xl border border-(--color-border) bg-(--color-page) px-5 py-4 text-base leading-7 text-(--color-foreground) outline-none transition focus:border-(--color-accent)"
                placeholder="Paste a post that feels unmistakably yours."
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={addExamplePost}
          disabled={form.examplePosts.length >= MAX_POST_FIELDS}
          className="min-h-11 rounded-full border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-foreground) transition hover:bg-(--color-surface-strong) disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add another sample
        </button>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm text-(--color-danger)">{feedback}</p>
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 w-full rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Saving profile..." : "Save and open studio"}
        </button>
      </div>
    </form>
  );
}