"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth";
import { CAMPUS_EMAIL_MESSAGE, isCampusEmail } from "@/lib/campus";
import { prisma } from "@/lib/db";

export type AuthState = {
  error?: string;
  values?: { email?: string; name?: string; department?: string; semester?: string };
};

const credentials = z.object({
  email: z
    .string()
    .email("Enter a valid email address.")
    .refine(isCampusEmail, CAMPUS_EMAIL_MESSAGE),
  password: z.string().min(8, "Passwords need at least 8 characters."),
});

const signupSchema = credentials.extend({
  name: z.string().min(2, "Tell us your name."),
  department: z.string().optional(),
  semester: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const parsed = credentials.safeParse({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your details.",
      values: { email },
    };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect.", values: { email } };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const department = String(formData.get("department") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const values = { email, name, department, semester };
  const parsed = signupSchema.safeParse({
    name,
    email,
    password: String(formData.get("password") ?? ""),
    department: department || undefined,
    semester: semester || undefined,
    interests: formData.getAll("interests").map(String),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your details.",
      values,
    };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "That email already has an account.", values };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      department: parsed.data.department,
      semester: parsed.data.semester,
      interests: (parsed.data.interests ?? []).join(","),
    },
  });

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function logout() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
