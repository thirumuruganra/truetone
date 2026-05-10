"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { href: "/settings", label: "Voice profile" },
  { href: "/dashboard", label: "Writer studio" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="stage-reveal flex min-h-0 flex-col rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_22px_60px_-46px_color-mix(in_oklch,var(--color-shadow)_62%,transparent)] sm:p-6 lg:h-full lg:shadow-[0_28px_80px_-46px_color-mix(in_oklch,var(--color-shadow)_70%,transparent)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between lg:flex-col lg:items-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--color-muted)">
            TrueTone
          </p>
          <h2 className="font-display text-3xl leading-none text-(--color-foreground)">
            Writing studio
          </h2>
        </div>
        <ThemeToggle className="w-full sm:w-auto sm:min-w-56 lg:w-full lg:max-w-60" />
        <p className="max-w-xs text-sm leading-6 text-(--color-muted)">
          Keep your positioning, source material, and final draft in one room built for editorial focus.
        </p>
      </div>

      <nav className="mt-6 flex flex-wrap gap-3 lg:mt-8 lg:flex-col">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-[1.4rem] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-colors lg:flex-none ${
                active
                  ? "bg-(--color-accent) text-(--color-accent-foreground)"
                  : "text-(--color-foreground) hover:bg-(--color-surface-strong)"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.4rem] border border-(--color-border) bg-(--color-page) px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--color-foreground) hover:bg-(--color-surface-strong) lg:mt-auto"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </aside>
  );
}