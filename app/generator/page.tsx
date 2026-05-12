import Link from "next/link";

import { AuthButtons } from "@/components/AuthButtons";
import { DashboardShell } from "@/components/DashboardShell";
import { DraftWorkspace } from "@/components/DraftWorkspace";
import {
  getAuthSession,
  hasConfiguredAuthProviders,
  hasGoogleAuthProvider,
  hasLinkedInAuthProvider,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GeneratorPage() {
  const session = await getAuthSession();
  const authReady = hasConfiguredAuthProviders();
  const hasGoogle = hasGoogleAuthProvider();
  const hasLinkedIn = hasLinkedInAuthProvider();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { context: true },
      })
    : null;
  const isAuthenticated = Boolean(session?.user?.email && user);
  const hasContext = Boolean(user?.context);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-none flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6 lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:px-6 lg:py-6 xl:px-8">
      <DashboardShell
        eyebrow="Generator"
        title="Shape the idea, then sharpen the post."
        description="Draft fast on the left. Let TrueTone generate a cleaner version. Edit the final output until it reads like something you would actually publish."
      >
        {!isAuthenticated ? (
          <section className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                  Public page
                </p>
                <h2 className="font-display text-3xl leading-[0.94] text-(--color-foreground)">
                  Use the writing room as a preview, then sign in to generate.
                </h2>
                <p className="text-sm leading-6 text-(--color-muted)">
                  Drafting stays open to everyone. Sign in when you want Gemini generation, saved drafts, and revision prompts.
                </p>
              </div>

              {authReady ? (
                <div className="w-full max-w-sm">
                  <AuthButtons callbackUrl="/generator" hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />
                </div>
              ) : (
                <div className="max-w-sm rounded-[1.6rem] border border-(--color-border) bg-(--color-page) px-5 py-4 text-sm leading-6 text-(--color-muted)">
                  Add OAuth keys in .env.local to enable generation and synced draft history.
                </div>
              )}
            </div>
          </section>
        ) : !hasContext ? (
          <section className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                  Tone profile needed
                </p>
                <h2 className="font-display text-3xl leading-[0.94] text-(--color-foreground)">
                  Finish your tone profile before you generate.
                </h2>
                <p className="text-sm leading-6 text-(--color-muted)">
                  The generator is public now, but generation still depends on saved audience, voice, and sample-post context.
                </p>
              </div>

              <Link
                href="/tone"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground)"
              >
                Open tone profile
              </Link>
            </div>
          </section>
        ) : null}

        <DraftWorkspace isAuthenticated={isAuthenticated} hasContext={hasContext} />
      </DashboardShell>
    </main>
  );
}