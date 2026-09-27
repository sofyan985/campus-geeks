import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/// Postgres via the pg driver adapter. DATABASE_URL should be the Supabase
/// session-pooler URI (IPv4) — see the README. A missing URL surfaces as a
/// connection error on first query rather than at import time so `next build`
/// can complete without database access.
function createClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
