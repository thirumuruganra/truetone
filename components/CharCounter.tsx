type CharCounterProps = {
  count: number;
  limit?: number;
};

export function CharCounter({ count, limit = 1500 }: CharCounterProps) {
  const ratio = count / limit;
  const toneClass =
    ratio > 1
      ? "text-[color:var(--color-danger)]"
      : ratio > 0.9
        ? "text-[color:var(--color-warning)]"
        : "text-[color:var(--color-muted)]";

  return (
    <p className={`text-sm font-medium ${toneClass}`}>
      {count} / {limit} characters
    </p>
  );
}