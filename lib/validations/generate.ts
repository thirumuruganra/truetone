import { z } from "zod";

import { cleanUserText } from "@/lib/security/input";

const draftSchema = z.string().transform(cleanUserText).pipe(
  z
    .string()
    .min(20, "Add a little more context before generating.")
    .max(4000, "Keep the draft under 4000 characters."),
);

export const generateSchema = z.object({
  draft: draftSchema,
});

export type GenerateInput = z.infer<typeof generateSchema>;