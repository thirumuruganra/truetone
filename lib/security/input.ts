import { NextRequest, NextResponse } from "next/server";

const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;

type JsonRequestOptions = {
  maxBytes?: number;
  errorLabel?: string;
};

const DEFAULT_MAX_JSON_BYTES = 16_384;

export function cleanUserText(input: string) {
  return input
    .normalize("NFKC")
    .replace(ZERO_WIDTH_PATTERN, "")
    .replace(CONTROL_CHARS_PATTERN, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/[\t ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function readJsonBody<T extends Record<string, unknown>>(
  request: NextRequest,
  options: JsonRequestOptions = {},
) {
  const { maxBytes = DEFAULT_MAX_JSON_BYTES, errorLabel = "request payload" } = options;
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (!contentType.startsWith("application/json")) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Expected application/json for the ${errorLabel}.` },
        { status: 415 },
      ),
    };
  }

  const rawBody = await request.text();
  const bodySize = new TextEncoder().encode(rawBody).length;

  if (bodySize === 0) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Missing ${errorLabel}.` },
        { status: 400 },
      ),
    };
  }

  if (bodySize > maxBytes) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `${errorLabel} is too large.` },
        { status: 413 },
      ),
    };
  }

  try {
    const parsedBody = JSON.parse(rawBody) as unknown;

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: `Invalid ${errorLabel}.` },
          { status: 400 },
        ),
      };
    }

    return {
      ok: true as const,
      data: parsedBody as T,
    };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `Invalid JSON in the ${errorLabel}.` },
        { status: 400 },
      ),
    };
  }
}