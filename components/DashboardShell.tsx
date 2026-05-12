"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/Sidebar";

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({ eyebrow, title, description, children }: DashboardShellProps) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true);
  const [isEdgeOpen, setIsEdgeOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPinnedOpen(false);
        setIsEdgeOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex flex-1 min-h-0 flex-col gap-5">
      <Sidebar
        isPinnedOpen={isPinnedOpen}
        isEdgeOpen={isEdgeOpen}
        onPinnedOpenChange={setIsPinnedOpen}
        onEdgeOpenChange={setIsEdgeOpen}
      />

      <section
        className={`scrollbar-hidden stage-reveal relative min-h-0 overflow-y-auto overflow-x-hidden rounded-4xl border border-(--color-border) bg-(--color-page) p-4 shadow-[0_24px_70px_-54px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] transition-[margin] duration-300 ease-out sm:rounded-5xl sm:p-6 lg:p-7 lg:shadow-[0_34px_100px_-60px_color-mix(in_oklch,var(--color-shadow)_72%,transparent)] xl:p-8 ${
          isPinnedOpen ? "lg:ml-78" : "lg:ml-0"
        }`}
      >
        <div className="panel-divider bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--color-line)_80%,transparent),transparent)]" />
        <div className="absolute -right-20 top-14 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--color-accent)_12%,transparent)] blur-3xl" />

        <div className="panel-divider-gap relative space-y-6 lg:space-y-7">
          <div className="space-y-2.5 lg:max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-muted)">
              {eyebrow}
            </p>
            <h1 className="font-display text-4xl leading-[0.96] text-(--color-foreground) sm:text-5xl sm:leading-[0.92] xl:text-6xl">
              {title}
            </h1>
            <p className="max-w-4xl text-base leading-7 text-(--color-muted) sm:text-[1.05rem] sm:leading-8">
              {description}
            </p>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}