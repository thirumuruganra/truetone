import { NextRequest, NextResponse } from "next/server";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
  userKey?: string | null;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function sanitizeKeyPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9:._-]/g, "_");
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [clientIp] = forwardedFor.split(",");

    if (clientIp) {
      return clientIp.trim();
    }
  }

  const proxyHeaders = ["x-real-ip", "cf-connecting-ip", "fastly-client-ip"];

  for (const header of proxyHeaders) {
    const value = request.headers.get(header);

    if (value) {
      return value.trim();
    }
  }

  return "unknown";
}

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function buildRateLimitKey(request: NextRequest, options: RateLimitOptions) {
  const userPart = options.userKey ? `user:${sanitizeKeyPart(options.userKey)}` : "user:anonymous";
  const ipPart = `ip:${sanitizeKeyPart(getClientIp(request))}`;

  return `${options.bucket}:${userPart}:${ipPart}`;
}

export function checkRateLimit(request: NextRequest, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const key = buildRateLimitKey(request, options);
  const currentEntry = rateLimitStore.get(key);
  const entry =
    currentEntry && currentEntry.resetAt > now
      ? currentEntry
      : {
          count: 0,
          resetAt: now + options.windowMs,
        };

  entry.count += 1;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(options.limit - entry.count, 0);
  const retryAfterSeconds = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);

  return {
    allowed: entry.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

export function applyRateLimitHeaders(response: NextResponse, result: RateLimitResult) {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    response.headers.set("Retry-After", String(result.retryAfterSeconds));
  }

  return response;
}

export function createRateLimitResponse(result: RateLimitResult) {
  const response = NextResponse.json(
    { error: "Rate limit exceeded. Try again shortly." },
    { status: 429 },
  );

  return applyRateLimitHeaders(response, result);
}