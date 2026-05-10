import { NextResponse } from "next/server";

import { hasConfiguredAuthProviders } from "@/lib/auth";
import { hasGeminiConfig } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

async function getDatabaseStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return "ok" as const;
  } catch {
    return "error" as const;
  }
}

export async function GET() {
  const database = await getDatabaseStatus();
  const responseStatus = database === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: {
        database,
        geminiConfig: hasGeminiConfig() ? "configured" : "missing",
        authProviders: hasConfiguredAuthProviders() ? "configured" : "missing",
      },
    },
    { status: responseStatus },
  );
}

export async function HEAD() {
  const response = await GET();

  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}