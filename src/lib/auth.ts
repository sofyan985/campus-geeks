import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "campus_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
};

function secret() {
  return process.env.AUTH_SECRET ?? "campus-geeks-development-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function verify(value: string, signature: string) {
  const expected = Buffer.from(sign(value));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [userId, signature] = raw.split(".");
  if (!userId || !signature || !verify(userId, signature)) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    interests: user.interests ? user.interests.split(",").filter(Boolean) : [],
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
