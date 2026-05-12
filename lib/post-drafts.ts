export const MAX_REVISION_PROMPTS = 3;

export function getRemainingRevisionPrompts(revisionCount: number) {
  return Math.max(MAX_REVISION_PROMPTS - revisionCount, 0);
}