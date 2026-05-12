import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthButtons } from "@/components/AuthButtons";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  getAuthSession,
  hasConfiguredAuthProviders,
  hasGoogleAuthProvider,
  hasLinkedInAuthProvider,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const authError = (await cookies()).has("auth-error");
  const session = await getAuthSession();

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { context: true },
    });

    redirect(user?.context ? "/generator" : "/tone");
  }

  const authReady = hasConfiguredAuthProviders();
  const hasGoogle = hasGoogleAuthProvider();
  const hasLinkedIn = hasLinkedInAuthProvider();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-368 flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
      <div className="grid items-start gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
        <section
          className="stage-reveal relative isolate overflow-hidden rounded-[2.4rem] border border-(--color-border) bg-(--color-surface) px-5 py-8 shadow-[0_34px_100px_-62px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] sm:rounded-[3rem] sm:px-10 sm:py-12 lg:min-h-176 lg:px-14 lg:py-14 lg:shadow-[0_52px_140px_-70px_color-mix(in_oklch,var(--color-shadow)_75%,transparent)]"
          style={{ animationDelay: "90ms" }}
        >
          <div className="panel-divider bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--color-line)_75%,transparent),transparent)]" />
          <div className="absolute -right-16 top-20 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--color-accent)_18%,transparent)] blur-3xl" />
          <div className="absolute bottom-10 left-10 h-28 w-28 rounded-full border border-(--color-border) bg-[color-mix(in_oklch,var(--color-page)_82%,var(--color-accent)_18%)]" />

          <div className="panel-divider-gap relative flex h-full flex-col justify-between gap-12">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.34em] text-(--color-muted)">
                <span className="rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2">Editorial AI</span>
                <span className="rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2">Voice-aware workflow</span>
              </div>

              <div className="space-y-6">
                <h1 className="max-w-5xl font-display text-5xl leading-[1.02] text-(--color-foreground) sm:text-6xl sm:leading-[0.98] lg:text-[6.8rem] lg:leading-[0.92]">
                  Sharpen the post.
                  <br />
                  Keep the voice
                  <span className="text-(--color-accent)"> unmistakably yours.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-(--color-muted) sm:text-xl">
                  TrueTone turns rough notes into publishable LinkedIn drafts using your audience, your phrasing, and the posts that already sound like you. The point is clarity with a pulse, not generic polish.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-4 rounded-[1.8rem] bg-[color-mix(in_oklch,var(--color-page)_70%,transparent)] p-2 sm:rounded-4xl sm:p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                  What changes
                </p>
                <div className="space-y-4 text-sm leading-7 text-(--color-foreground)">
                  <p>Rough thoughts become a clear angle, structure, and final line.</p>
                  <p>Your examples teach the model how you sound before it writes a word.</p>
                  <p>The last pass still happens in the editor, where judgment belongs.</p>
                </div>
              </div>

              <div className="rounded-4xl border border-(--color-border) bg-[color-mix(in_oklch,var(--color-accent)_7%,var(--color-page))] p-5 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-surface)_80%,transparent)] sm:rounded-[2.25rem] sm:p-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                      Studio sample
                    </p>
                    <h2 className="mt-3 font-display text-3xl leading-none text-(--color-foreground) sm:text-4xl">
                      From notes to a point of view.
                    </h2>
                  </div>
                  <span className="self-start whitespace-nowrap rounded-full bg-(--color-accent) px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-(--color-accent-foreground)">
                    Before / after
                  </span>
                </div>

                <div className="mt-6 grid gap-4 text-sm leading-7 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-(--color-border) bg-(--color-surface) p-5 text-(--color-muted)">
                    Students copy founder-style posts because they think polished equals credible. Most of it is tidy, forgettable, and not really theirs.
                  </div>
                  <div className="rounded-[1.6rem] border border-(--color-border) bg-(--color-surface) p-5 text-(--color-foreground)">
                    The fastest way to sound replaceable on LinkedIn is to borrow a voice that was never built from your own work. Clarity lands harder when the phrasing still sounds like you.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="stage-reveal space-y-6 rounded-4xl border border-(--color-border) bg-[color-mix(in_oklch,var(--color-page)_88%,var(--color-surface)_12%)] p-6 shadow-[0_28px_70px_-56px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] sm:rounded-[2.5rem] sm:p-8 lg:sticky lg:top-8 lg:shadow-[0_34px_90px_-60px_color-mix(in_oklch,var(--color-shadow)_70%,transparent)]"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex justify-end">
            <ThemeToggle className="w-full sm:w-auto sm:min-w-60" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-(--color-muted)">
              Start here
            </p>
            <h2 className="font-display text-3xl leading-[0.98] text-(--color-foreground) sm:text-4xl sm:leading-[0.94]">
              Build the tone profile, then open the writing room.
            </h2>
            <p className="text-base leading-7 text-(--color-muted)">
              Save your positioning, audience, preferred phrases, and sample posts once. Every draft after that starts from a better editorial memory.
            </p>
          </div>

          {authError ? (
            <div
              role="status"
              className="rounded-[1.6rem] border border-[color-mix(in_oklch,var(--color-accent)_30%,var(--color-border))] bg-[color-mix(in_oklch,var(--color-accent)_10%,var(--color-surface))] px-5 py-4 text-sm leading-7 text-(--color-foreground)"
            >
              Sign-in could not be completed. Try again.
            </div>
          ) : null}

          {authReady ? (
            <AuthButtons hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />
          ) : (
            <div className="rounded-[1.85rem] border border-(--color-border) bg-(--color-surface) p-5 text-sm leading-7 text-(--color-muted)">
              Add your OAuth keys in <code>.env.local</code> to enable sign-in. The Prisma schema, protected routes, and writing workflow are already in place.
            </div>
          )}

          <div className="rounded-[1.8rem] border border-(--color-border) bg-(--color-surface) p-5 sm:rounded-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
              Writing cadence
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-(--color-foreground)">
              <p>1. Define how you sound and what you refuse to sound like.</p>
              <p>2. Feed the studio a rough note, not a polished performance.</p>
              <p>3. Edit the final pass until it reads like a real post you would publish.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
