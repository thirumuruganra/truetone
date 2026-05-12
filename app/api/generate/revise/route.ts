import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { hasGeminiConfig, reviseLinkedInPost } from "@/lib/gemini";
import { getRemainingRevisionPrompts } from "@/lib/post-drafts";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimitHeaders,
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/input";
import { reviseSchema } from "@/lib/validations/generate";

const REVISE_RATE_LIMIT = {
  bucket: "revise",
  limit: 10,
  windowMs: 60_000,
};

const REVISE_BODY_LIMIT_BYTES = 12_288;

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const rateLimit = checkRateLimit(request, {
    ...REVISE_RATE_LIMIT,
    userKey: session?.user?.email ?? null,
  });

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  if (!session?.user?.email) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      rateLimit,
    );
  }

  if (!hasGeminiConfig()) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: "Missing Gemini configuration. Add GEMINI_API_KEY to continue." },
        { status: 503 },
      ),
      rateLimit,
    );
  }

  const body = await readJsonBody(request, {
    maxBytes: REVISE_BODY_LIMIT_BYTES,
    errorLabel: "revision payload",
  });

  if (!body.ok) {
    return applyRateLimitHeaders(body.response, rateLimit);
  }

  const parsed = reviseSchema.safeParse(body.data);

  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid revision payload." },
        { status: 400 },
      ),
      rateLimit,
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { context: true },
  });

  if (!user?.context) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: "Complete your tone profile before revising a post." },
        { status: 400 },
      ),
      rateLimit,
    );
  }

  const postDraft = await prisma.postDraft.findFirst({
    where: {
      id: parsed.data.postDraftId,
      userId: user.id,
    },
  });

  if (!postDraft) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: "Generated post not found." },
        { status: 404 },
      ),
      rateLimit,
    );
  }

  const remainingPrompts = getRemainingRevisionPrompts(postDraft.revisionCount);

  if (remainingPrompts <= 0) {
    return applyRateLimitHeaders(
      NextResponse.json(
        {
          error: "You have used all 3 revision prompts for this post.",
          remainingPrompts: 0,
        },
        { status: 403 },
      ),
      rateLimit,
    );
  }

  try {
    const generated = await reviseLinkedInPost({
      originalDraft: postDraft.original,
      editedPost: parsed.data.editedPost,
      instruction: parsed.data.instruction,
      context: user.context,
    });

    const updatedDraft = await prisma.postDraft.updateMany({
      where: {
        id: postDraft.id,
        userId: user.id,
        revisionCount: {
          lt: 3,
        },
      },
      data: {
        generated,
        revisionCount: {
          increment: 1,
        },
      },
    });

    if (updatedDraft.count === 0) {
      return applyRateLimitHeaders(
        NextResponse.json(
          {
            error: "You have used all 3 revision prompts for this post.",
            remainingPrompts: 0,
          },
          { status: 403 },
        ),
        rateLimit,
      );
    }

    return applyRateLimitHeaders(
      NextResponse.json({
        generated,
        remainingPrompts: getRemainingRevisionPrompts(postDraft.revisionCount + 1),
      }),
      rateLimit,
    );
  } catch (error) {
    return applyRateLimitHeaders(
      NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to revise the post right now.",
        },
        { status: 500 },
      ),
      rateLimit,
    );
  }
}