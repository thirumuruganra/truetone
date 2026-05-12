"use client";

import { ChevronLeft, LogOut, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { href: "/tone", label: "Tone profile" },
  { href: "/generator", label: "Generator" },
];

const pageContent = {
  tone: {
    title: "Tone profile",
    description: "Define audience, voice, and source material so the model starts from sharper editorial memory.",
    noteLabel: "Profile focus",
    noteBody: "Describe how you sound, what you avoid, and which past posts feel most like you before generating anything new.",
  },
  generator: {
    title: "Generator",
    description: "Draft rough notes fast, shape the output, then keep editing until the post reads like your own work.",
    noteLabel: "Writing cadence",
    noteBody: "Draft first. Generate once the angle is clear. Tighten the final pass until it reads like you.",
  },
} as const;

type SidebarProps = {
  isPinnedOpen: boolean;
  isEdgeOpen: boolean;
  onPinnedOpenChange: (isOpen: boolean) => void;
  onEdgeOpenChange: (isOpen: boolean) => void;
};

export function Sidebar({ isPinnedOpen, isEdgeOpen, onPinnedOpenChange, onEdgeOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const isDesktopOpen = isPinnedOpen || isEdgeOpen;
  const isTonePage = pathname.startsWith("/tone");
  const currentPage = isTonePage ? pageContent.tone : pageContent.generator;

  function handleDesktopToggle() {
    const next = !isPinnedOpen;
    onPinnedOpenChange(next);

    if (!next) {
      onEdgeOpenChange(false);
    }
  }

  function handleDesktopClose() {
    if (!isPinnedOpen) {
      onEdgeOpenChange(false);
    }
  }

  return (
    <>
      <div
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-5"
        aria-hidden="true"
        onMouseEnter={() => onEdgeOpenChange(true)}
      />

      <button
        type="button"
        onClick={handleDesktopToggle}
        aria-label={isDesktopOpen ? "Hide sidebar" : "Show sidebar"}
        aria-expanded={isDesktopOpen}
        className={`hidden lg:fixed lg:left-5 lg:top-5 lg:z-40 lg:h-11 lg:w-11 lg:items-center lg:justify-center lg:rounded-2xl lg:border lg:border-(--color-border) lg:bg-(--color-surface) lg:text-(--color-foreground) lg:shadow-[0_18px_45px_-30px_color-mix(in_oklch,var(--color-shadow)_60%,transparent)] ${
          isDesktopOpen ? "lg:pointer-events-none lg:opacity-0" : "lg:inline-flex lg:opacity-100"
        }`}
      >
        <PanelLeft className="size-4" />
      </button>

      <aside
        onMouseEnter={() => onEdgeOpenChange(true)}
        onMouseLeave={handleDesktopClose}
        className={`stage-reveal flex min-h-0 flex-col rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_22px_60px_-46px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] sm:p-6 lg:fixed lg:inset-y-4 lg:left-4 lg:z-30 lg:w-74 lg:rounded-4xl lg:border-[color-mix(in_oklch,var(--color-border)_94%,transparent)] lg:bg-[color-mix(in_oklch,var(--color-surface)_95%,var(--color-page))] lg:shadow-[0_28px_80px_-46px_color-mix(in_oklch,var(--color-shadow)_70%,transparent)] lg:backdrop-blur-sm lg:transition lg:duration-300 lg:ease-out ${
          isDesktopOpen
            ? "lg:pointer-events-auto lg:translate-x-0 lg:opacity-100"
            : "lg:pointer-events-none lg:-translate-x-[calc(100%+2rem)] lg:opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
                TrueTone
              </p>
              <div className="space-y-2">
                <h2 className="font-display text-[2.5rem] leading-[0.94] text-(--color-foreground)">
                  {currentPage.title}
                </h2>
                <p className="max-w-xs text-sm leading-6 text-(--color-muted)">
                  {currentPage.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDesktopToggle}
              aria-label="Hide sidebar"
              className="hidden lg:inline-flex lg:h-11 lg:w-11 lg:shrink-0 lg:items-center lg:justify-center lg:rounded-2xl lg:border lg:border-(--color-border) lg:bg-(--color-page) lg:text-(--color-foreground)"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          <ThemeToggle className="w-full" />
        </div>

        <nav className="mt-7 flex flex-col gap-1.5">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-11 items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-(--color-page) text-(--color-foreground) shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-border)_72%,transparent)]"
                    : "text-(--color-muted) hover:bg-(--color-page) hover:text-(--color-foreground)"
                }`}
              >
                <span className="uppercase tracking-[0.2em]">{item.label}</span>
                <span
                  className={`h-2 w-2 rounded-full ${active ? "bg-(--color-accent)" : "bg-[color-mix(in_oklch,var(--color-border)_82%,transparent)]"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-[1.6rem] border border-(--color-border) bg-(--color-page) p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-(--color-muted)">
            {currentPage.noteLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-(--color-muted)">
            {currentPage.noteBody}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.4rem] border border-(--color-border) bg-(--color-page) px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--color-foreground) hover:bg-(--color-surface-strong) lg:mt-auto"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </aside>
    </>
  );
}