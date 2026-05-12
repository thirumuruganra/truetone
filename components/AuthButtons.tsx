"use client";

import { signIn } from "next-auth/react";

type AuthButtonsProps = {
  callbackUrl?: string;
  hasGoogle: boolean;
  hasLinkedIn: boolean;
};

export function AuthButtons({ callbackUrl = "/tone", hasGoogle, hasLinkedIn }: AuthButtonsProps) {
  return (
    <div className="grid gap-3">
      {hasGoogle ? (
        <button
          type="button"
          onClick={() => void signIn("google", { callbackUrl })}
          className="min-h-11 rounded-full bg-(--color-accent) px-6 py-4 text-center text-sm font-semibold text-(--color-accent-foreground) shadow-[0_18px_45px_-28px_color-mix(in_oklch,var(--color-shadow)_72%,transparent)]"
        >
          Continue with Google
        </button>
      ) : null}

      {hasLinkedIn ? (
        <button
          type="button"
          onClick={() => void signIn("linkedin", { callbackUrl })}
          className="min-h-11 rounded-full border border-(--color-border) bg-(--color-surface) px-6 py-4 text-center text-sm font-semibold text-(--color-foreground)"
        >
          Continue with LinkedIn
        </button>
      ) : null}
    </div>
  );
}