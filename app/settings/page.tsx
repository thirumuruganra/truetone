import { redirect } from "next/navigation";

import { ContextForm } from "@/components/ContextForm";
import { Sidebar } from "@/components/Sidebar";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeExamplePosts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => String(entry));
}

export default async function SettingsPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { context: true },
  });

  if (!user) {
    redirect("/");
  }

  const initialValues = user.context
    ? {
        identity: user.context.identity,
        audience: user.context.audience,
        voiceAdjectives: user.context.voiceAdjectives,
        phrasesToUse: user.context.phrasesToUse ?? "",
        phrasesToAvoid: user.context.phrasesToAvoid ?? "",
        examplePosts: normalizeExamplePosts(user.context.examplePosts),
      }
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:px-16 lg:py-8">
      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <Sidebar />

        <section className="scrollbar-hidden stage-reveal relative min-h-0 overflow-y-auto overflow-x-hidden rounded-4xl border border-(--color-border) bg-(--color-page) p-5 shadow-[0_24px_70px_-54px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] sm:rounded-[2.5rem] sm:p-8 lg:p-10 lg:shadow-[0_34px_100px_-60px_color-mix(in_oklch,var(--color-shadow)_72%,transparent)]">
          <div className="panel-divider bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--color-line)_80%,transparent),transparent)]" />
          <div className="absolute -right-20 top-14 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--color-accent)_12%,transparent)] blur-3xl" />

          <div className="panel-divider-gap relative space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-muted)">
                Tone profile
              </p>
              <h1 className="font-display text-4xl leading-[0.96] text-(--color-foreground) sm:text-6xl sm:leading-[0.92]">
                Give the model a better memory of you.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-(--color-muted)">
                A strong output starts with clear constraints. Tell TrueTone how you sound, who you write for, and what a good post already feels like in your world.
              </p>
            </div>

            <ContextForm initialValues={initialValues} />
          </div>
        </section>
      </div>
    </main>
  );
}