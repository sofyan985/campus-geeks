import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/// Postgres via the pg driver adapter. DATABASE_URL should be the Supabase
/// session-pooler URI (IPv4) — see the README. A missing URL surfaces as a
/// connection error on first query rather than at import time so `next build`
/// can complete without database access.
const DIRECT_SUPABASE_HOST = /@db\.[a-z0-9]+\.supabase\.co[:/]/;

/// Prefer a pooler URL: the direct Supabase host is IPv6-only and unreachable
/// from Vercel. Falls back through the variables the Supabase/Vercel
/// integration sets when DATABASE_URL is missing or points at the direct host.
export function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ].filter((url): url is string => Boolean(url));
  return candidates.find((url) => !DIRECT_SUPABASE_HOST.test(url)) ?? candidates[0] ?? "";
}

/// Hostname of the active connection, safe to show (no credentials).
export function databaseHost() {
  try {
    return new URL(resolveDatabaseUrl()).hostname || null;
  } catch {
    return null;
  }
}

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
