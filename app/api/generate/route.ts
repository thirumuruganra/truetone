import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { generateLinkedInPost, hasGeminiConfig } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimitHeaders,
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/input";
import { generateSchema } from "@/lib/validations/generate";

const GENERATE_RATE_LIMIT = {
  bucket: "generate",
  limit: 5,
  windowMs: 60_000,
};

const GENERATE_BODY_LIMIT_BYTES = 8_192;

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const rateLimit = checkRateLimit(request, {
    ...GENERATE_RATE_LIMIT,
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
    maxBytes: GENERATE_BODY_LIMIT_BYTES,
    errorLabel: "draft payload",
  });

  if (!body.ok) {
    return applyRateLimitHeaders(body.response, rateLimit);
  }

  const parsed = generateSchema.safeParse(body.data);

  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid draft payload." },
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
    return NextResponse.json(
      { error: "Complete your voice profile before generating a post." },
      { status: 400 },
    );
  }

  try {
    const generated = await generateLinkedInPost({
      draft: parsed.data.draft,
      context: user.context,
    });

    await prisma.postDraft.create({
      data: {
        userId: user.id,
        original: parsed.data.draft,
        generated,
      },
    });

    return applyRateLimitHeaders(NextResponse.json({ generated }), rateLimit);
  } catch (error) {
    return applyRateLimitHeaders(
      NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to generate a post right now.",
        },
        { status: 500 },
      ),
      rateLimit,
    );
  }
}