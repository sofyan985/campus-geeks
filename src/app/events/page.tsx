import { Suspense } from "react";
import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRegistrationInfo } from "@/lib/events";
import { addDays, campusDayIndex, startOfDay } from "@/lib/format";
import { eventInclude, getBookmarkedIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search and filter everything happening around campus.",
};

type Search = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const q = single(params.q)?.trim();
  const category = single(params.category);
  const when = single(params.when);
  const society = single(params.society);
  const price = single(params.price);
  const status = single(params.status);
  const sort = single(params.sort);

  const today = startOfDay(new Date());
  let startFrom: Date = new Date();
  let startTo: Date | undefined;

  if (when === "today") {
    startTo = addDays(today, 1);
  } else if (when === "week") {
    startTo = addDays(today, 7);
  } else if (when === "month") {
    startTo = addDays(today, 30);
  } else if (when === "weekend") {
    const day = campusDayIndex(today);
    const daysToSaturday = (6 - day + 7) % 7;
    startFrom = addDays(today, daysToSaturday);
    startTo = addDays(startFrom, 2);
  }

  const [user, societies, results] = await Promise.all([
    getSessionUser(),
    prisma.society.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.event.findMany({
      where: {
        status:
          status === "closed"
            ? "REGISTRATION_CLOSED"
            : { in: ["APPROVED", "REGISTRATION_CLOSED"] },
        startAt: { gte: startFrom, ...(startTo ? { lt: startTo } : {}) },
        ...(category ? { category } : {}),
        ...(society ? { society: { slug: society } } : {}),
        ...(price === "free" ? { cost: 0 } : {}),
        ...(price === "paid" ? { cost: { gt: 0 } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { venue: { contains: q, mode: "insensitive" } },
                { organizerName: { contains: q, mode: "insensitive" } },
                { tag: { contains: q, mode: "insensitive" } },
                { match: { is: { OR: [
                        { teamA: { contains: q, mode: "insensitive" } },
                        { teamB: { contains: q, mode: "insensitive" } },
                        { sport: { contains: q, mode: "insensitive" } },
                      ] } } },
              ],
            }
          : {}),
      },
      include: eventInclude,
      orderBy:
        sort === "trending"
          ? [{ interest: "desc" }, { startAt: "asc" }]
          : sort === "new"
            ? { createdAt: "desc" }
            : { startAt: "asc" },
      take: 60,
    }),
  ]);

  const filtered = results.filter((event) => {
    if (status === "open") {
      const state = getRegistrationInfo(event).state;
      return state === "OPEN" || state === "FILLING_FAST";
    }
    if (status === "full") return getRegistrationInfo(event).state === "FULL";
    return true;
  });

  const saved = await getBookmarkedIds(user?.id);
  const pathname = "/events";

  return (
    <div className="grain mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
      <p className="eyebrow text-[color:var(--color-violet)]">Discover</p>
      <h1 className="display mt-3 text-5xl leading-[0.95] text-[color:var(--color-chalk)] md:text-7xl">
        Find your next thing to do
      </h1>
      <p className="mt-4 max-w-2xl text-[#9A99B5]">
        Filter by category, date, society, price or registration status.
      </p>

      <div className="mt-10">
        <Suspense fallback={<div className="h-40" />}>
          <EventFilters societies={societies} />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-[#6B6B85]">
        {filtered.length} {filtered.length === 1 ? "activity" : "activities"}
        {q ? ` matching "${q}"` : ""}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            saved={saved.has(event.id)}
            signedIn={Boolean(user)}
            pathname={pathname}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-10 text-center">
          <p className="display text-2xl text-[color:var(--color-chalk)]">Nothing here yet</p>
          <p className="mt-2 text-sm text-[#9A99B5]">
            Try clearing a filter, or host the activity yourself.
          </p>
        </div>
      ) : null}
    </div>
  );
}
