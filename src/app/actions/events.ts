"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser, requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORY_KEYS } from "@/lib/categories";
import { slugify } from "@/lib/events";
import { fromCampusLocal } from "@/lib/format";

export type FormState = { error?: string; ok?: boolean };

const createSchema = z.object({
  title: z.string().min(4, "Give the event a title."),
  subtitle: z.string().optional(),
  description: z.string().min(20, "Describe the event in at least 20 characters."),
  category: z.enum(CATEGORY_KEYS as [string, ...string[]]),
  tag: z.string().optional(),
  coverImage: z.string().url("Cover image must be a URL.").optional().or(z.literal("")),
  date: z.string().min(1, "Pick a date."),
  startTime: z.string().min(1, "Pick a start time."),
  endTime: z.string().optional(),
  venue: z.string().min(2, "Where is it happening?"),
  campusLocation: z.string().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
  cost: z.coerce.number().int().min(0).optional(),
  costNote: z.string().optional(),
  eligibility: z.string().optional(),
  registrationRequired: z.coerce.boolean().optional(),
  googleFormUrl: z.string().url("Registration link must be a URL.").optional().or(z.literal("")),
  organizerName: z.string().min(2, "Who is organizing this?"),
  contactInfo: z.string().optional(),
  societyId: z.string().optional(),
  // Sports
  sport: z.string().optional(),
  teamA: z.string().optional(),
  teamB: z.string().optional(),
  matchType: z.string().optional(),
  // Trips
  tripDeparture: z.string().optional(),
  tripReturn: z.string().optional(),
  tripDeparturePoint: z.string().optional(),
  tripIncluded: z.string().optional(),
  tripBring: z.string().optional(),
});

function combine(date: string, time: string | undefined) {
  if (!time) return null;
  return fromCampusLocal(date, time);
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "event";
  let slug = base;
  let counter = 2;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function createEvent(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sign in to publish an event." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createSchema.safeParse({
    ...raw,
    registrationRequired: formData.get("registrationRequired") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Some fields need attention." };
  }

  const data = parsed.data;
  const startAt = combine(data.date, data.startTime);
  if (!startAt) return { error: "That start date and time is not valid." };
  const endAt = combine(data.date, data.endTime);

  if (data.registrationRequired && !data.googleFormUrl) {
    return { error: "Add the Google Form URL participants should register through." };
  }

  const isMatchup = data.category === "sports" && data.teamA && data.teamB;
  const slug = await uniqueSlug(isMatchup ? `${data.teamA} vs ${data.teamB} ${data.sport ?? ""}` : data.title);

  const event = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description,
      category: data.category,
      tag: data.tag || null,
      coverImage: data.coverImage || null,
      startAt,
      endAt,
      venue: data.venue,
      campusLocation: data.campusLocation || null,
      capacity: data.capacity && data.capacity > 0 ? data.capacity : null,
      cost: data.cost ?? 0,
      costNote: data.costNote || null,
      eligibility: data.eligibility || null,
      registrationRequired: Boolean(data.registrationRequired),
      googleFormUrl: data.googleFormUrl || null,
      organizerName: data.organizerName,
      contactInfo: data.contactInfo || null,
      societyId: data.societyId || null,
      status: "PENDING",
      createdById: user.id,
      tripDeparture: data.tripDeparture || null,
      tripReturn: data.tripReturn || null,
      tripDeparturePoint: data.tripDeparturePoint || null,
      tripIncluded: data.tripIncluded || null,
      tripBring: data.tripBring || null,
      ...(isMatchup
        ? {
            match: {
              create: {
                sport: data.sport || "Football",
                teamA: data.teamA!,
                teamB: data.teamB!,
                matchType: data.matchType || "FRIENDLY",
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin");
  redirect(`/events/${event.slug}?submitted=1`);
}

export async function toggleBookmark(eventId: string, pathname: string) {
  const user = await requireUser();
  const existing = await prisma.bookmark.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({ data: { userId: user.id, eventId } });
    await prisma.event.update({
      where: { id: eventId },
      data: { interest: { increment: 1 } },
    });
  }

  revalidatePath(pathname);
  revalidatePath("/saved");
  return !existing;
}

export async function setEventStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.event.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const event = await prisma.event.findUniqueOrThrow({ where: { id } });
  await prisma.event.update({ where: { id }, data: { featured: !event.featured } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateParticipantCount(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const count = Number(formData.get("participantCount"));
  const event = await prisma.event.findUniqueOrThrow({ where: { id } });

  if (user.role !== "ADMIN" && event.createdById !== user.id) {
    throw new Error("Only the organizer or an admin can update this count.");
  }

  await prisma.event.update({
    where: { id },
    data: { participantCount: Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0 },
  });
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/admin");
}

function parseScore(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export async function recordMatchResult(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId"));
  const scoreA = parseScore(formData.get("scoreA"));
  const scoreB = parseScore(formData.get("scoreB"));
  if (scoreA === null || scoreB === null) {
    throw new Error("Enter both scores to record a result.");
  }

  await prisma.sportsMatch.update({
    where: { eventId },
    data: {
      scoreA,
      scoreB,
      resultRecordedAt: new Date(),
    },
  });
  await prisma.event.update({ where: { id: eventId }, data: { status: "COMPLETED" } });
  revalidatePath("/sports");
  revalidatePath("/admin");
}
