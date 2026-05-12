import { NextRequest, NextResponse } from "next/server";
import type { ZodIssue } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimitHeaders,
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/input";
import { contextSchema } from "@/lib/validations/context";

const CONTEXT_RATE_LIMIT = {
  bucket: "context",
  limit: 15,
  windowMs: 60_000,
};

const CONTEXT_BODY_LIMIT_BYTES = 16_384;

const CONTEXT_FIELD_LABELS: Record<string, string> = {
  identity: "Identity",
  audience: "Audience",
  voiceAdjectives: "Voice adjectives",
  phrasesToUse: "Phrases to use",
  phrasesToAvoid: "Phrases to avoid",
  examplePosts: "Example post",
};

function getContextFieldLabel(issue: ZodIssue) {
  const [fieldKey, index] = issue.path;

  if (fieldKey === "examplePosts" && typeof index === "number") {
    return `Example post ${index + 1}`;
  }

  if (typeof fieldKey === "string") {
    return CONTEXT_FIELD_LABELS[fieldKey] ?? fieldKey;
  }

  return "This field";
}

function formatContextValidationIssue(issue: ZodIssue) {
  const fieldLabel = getContextFieldLabel(issue);

  if (issue.code === "too_big" && typeof issue.maximum === "number") {
    return `${fieldLabel} is too long. Reduce the content in the ${fieldLabel} text box to ${issue.maximum} characters or fewer.`;
  }

  if (fieldLabel === "This field") {
    return issue.message || "Invalid context payload.";
  }

  return `${fieldLabel}: ${issue.message}`;
}

async function getCurrentUser() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { context: true },
  });
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ context: user.context });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const rateLimit = checkRateLimit(request, {
    ...CONTEXT_RATE_LIMIT,
    userKey: user?.email ?? null,
  });

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  if (!user) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      rateLimit,
    );
  }

  const body = await readJsonBody(request, {
    maxBytes: CONTEXT_BODY_LIMIT_BYTES,
    errorLabel: "context payload",
  });

  if (!body.ok) {
    return applyRateLimitHeaders(body.response, rateLimit);
  }

  const parsed = contextSchema.safeParse(body.data);

  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json(
        {
          error: parsed.error.issues[0]
            ? formatContextValidationIssue(parsed.error.issues[0])
            : "Invalid context payload.",
        },
        { status: 400 },
      ),
      rateLimit,
    );
  }

  const context = await prisma.socialContext.upsert({
    where: { userId: user.id },
    update: {
      identity: parsed.data.identity,
      audience: parsed.data.audience,
      voiceAdjectives: parsed.data.voiceAdjectives,
      phrasesToUse: parsed.data.phrasesToUse || null,
      phrasesToAvoid: parsed.data.phrasesToAvoid || null,
      examplePosts: parsed.data.examplePosts,
    },
    create: {
      userId: user.id,
      identity: parsed.data.identity,
      audience: parsed.data.audience,
      voiceAdjectives: parsed.data.voiceAdjectives,
      phrasesToUse: parsed.data.phrasesToUse || null,
      phrasesToAvoid: parsed.data.phrasesToAvoid || null,
      examplePosts: parsed.data.examplePosts,
    },
  });

  return applyRateLimitHeaders(NextResponse.json({ context }), rateLimit);
}