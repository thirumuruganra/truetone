import { z } from "zod";

import { cleanUserText } from "@/lib/security/input";

const boundedCleanedString = (min: number, max: number, minMessage: string) =>
  z.string().transform(cleanUserText).pipe(z.string().min(min, minMessage).max(max));

const optionalCleanedString = (max: number) =>
  z.string().optional().transform((value) => cleanUserText(value ?? "")).pipe(z.string().max(max));

export const contextSchema = z.object({
  identity: boundedCleanedString(8, 180, "Tell us who you are and how you position yourself."),
  audience: boundedCleanedString(12, 400, "Describe who you write for and what they need."),
  voiceAdjectives: boundedCleanedString(6, 120, "Add 3 to 5 voice descriptors."),
  phrasesToUse: optionalCleanedString(240),
  phrasesToAvoid: optionalCleanedString(240),
  examplePosts: z.array(boundedCleanedString(20, 2000, "Each example post needs at least 20 characters.")).min(2).max(5),
});

export type ContextInput = z.infer<typeof contextSchema>;