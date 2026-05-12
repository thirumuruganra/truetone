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

const postDraftIdSchema = z.string().transform(cleanUserText).pipe(
  z.string().min(1, "Missing generated post reference."),
);

const editedPostSchema = z.string().transform(cleanUserText).pipe(
  z
    .string()
    .min(20, "Keep at least a little of the edited post before revising.")
    .max(5000, "Keep the edited post under 5000 characters."),
);

const revisionInstructionSchema = z.string().transform(cleanUserText).pipe(
  z
    .string()
    .min(5, "Describe what should change before revising.")
    .max(500, "Keep the revision request under 500 characters."),
);

export const reviseSchema = z.object({
  postDraftId: postDraftIdSchema,
  editedPost: editedPostSchema,
  instruction: revisionInstructionSchema,
});

export type GenerateInput = z.infer<typeof generateSchema>;
export type ReviseInput = z.infer<typeof reviseSchema>;