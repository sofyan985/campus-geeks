import { NextResponse } from "next/server";
import { databaseHost, prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/// Deployment smoke check: reports whether the configured database answers,
/// without exposing credentials.
export async function GET() {
  const host = databaseHost();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: { host, reachable: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, database: { host, reachable: false, error: message } },
      { status: 503 },
    );
  }
}
