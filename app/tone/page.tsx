import { AuthButtons } from "@/components/AuthButtons";
import { ContextForm } from "@/components/ContextForm";
import { DashboardShell } from "@/components/DashboardShell";
import {
  getAuthSession,
  hasConfiguredAuthProviders,
  hasGoogleAuthProvider,
  hasLinkedInAuthProvider,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeExamplePosts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => String(entry));
}

export default async function TonePage() {
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
  const context = user?.context;

  const initialValues = context
    ? {
        identity: context.identity,
        audience: context.audience,
        voiceAdjectives: context.voiceAdjectives,
        phrasesToUse: context.phrasesToUse ?? "",
        phrasesToAvoid: context.phrasesToAvoid ?? "",
        examplePosts: normalizeExamplePosts(context.examplePosts),
      }
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-none flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6 lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:px-6 lg:py-6 xl:px-8">
      <DashboardShell
        eyebrow="Tone profile"
        title="Give the model a better memory of you."
        description="A strong output starts with clear constraints. Tell TrueTone how you sound, who you write for, and what a good post already feels like in your world."
      >
        {!isAuthenticated ? (
          <section className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                  Public page
                </p>
                <h2 className="font-display text-3xl leading-[0.94] text-(--color-foreground)">
                  Explore the tone builder before you sign in.
                </h2>
                <p className="text-sm leading-6 text-(--color-muted)">
                  You can review the full profile workflow here. Sign in when you want to save the profile and carry it into the generator.
                </p>
              </div>

              {authReady ? (
                <div className="w-full max-w-sm">
                  <AuthButtons callbackUrl="/tone" hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />
                </div>
              ) : (
                <div className="max-w-sm rounded-[1.6rem] border border-(--color-border) bg-(--color-page) px-5 py-4 text-sm leading-6 text-(--color-muted)">
                  Add OAuth keys in .env.local to enable saving and synced profile access.
                </div>
              )}
            </div>
          </section>
        ) : null}

        <ContextForm initialValues={initialValues} isAuthenticated={isAuthenticated} />
      </DashboardShell>
    </main>
  );
}