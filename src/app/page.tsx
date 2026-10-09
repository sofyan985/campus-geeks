import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Trophy } from "lucide-react";
import { CategoryTile } from "@/components/category-tile";
import { EventCard, EventRow } from "@/components/event-card";
import { MatchCard } from "@/components/match-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { getSessionUser } from "@/lib/auth";
import { CATEGORY_LIST, getCategory } from "@/lib/categories";
import { getRegistrationInfo } from "@/lib/events";
import { addDays, campusDayIndex, formatDay, formatShortDate, formatTime, startOfDay } from "@/lib/format";
import {
  getBookmarkedIds,
  getFeatured,
  getRecentResults,
  getTrending,
  getUpcoming,
  getUpcomingMatches,
  getWeekAhead,
} from "@/lib/queries";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function isWeekend(date: Date) {
  const day = campusDayIndex(date);
  return day === 0 || day === 6;
}

export default async function HomePage() {
  const [user, featured, upcoming, week, trending, matches, results, categoryCounts] =
    await Promise.all([
      getSessionUser(),
      getFeatured(4),
      getUpcoming(9),
      getWeekAhead(),
      getTrending(4),
      getUpcomingMatches(3),
      getRecentResults(3),
      prisma.event.groupBy({
        by: ["category"],
        where: { status: "APPROVED", startAt: { gte: new Date() } },
        _count: { _all: true },
      }),
    ]);

  const saved = await getBookmarkedIds(user?.id);
  const signedIn = Boolean(user);
  const counts = new Map(categoryCounts.map((row) => [row.category, row._count._all]));

  const hero = featured[0] ?? upcoming[0];
  const heroCategory = hero ? getCategory(hero.category) : null;

  const today = startOfDay(new Date());
  const tonight = upcoming.filter((event) => event.startAt < addDays(today, 1));
  const weekend = week.filter((event) => isWeekend(event.startAt));

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    return {
      date,
      events: week.filter(
        (event) => startOfDay(event.startAt).getTime() === date.getTime(),
      ),
    };
  }).filter((day) => day.events.length > 0);

  return (
    <div className="grain">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--color-line)]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-45 motion-reduce:hidden"
          src="/media/campus-hero.mp4"
          poster="/media/campus-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-cover bg-center opacity-40 motion-reduce:block"
          style={{ backgroundImage: "url(/media/campus-hero-poster.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/75 via-[#05050A]/88 to-[#05050A]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_20%,rgba(124,92,255,0.22),transparent_60%)]" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#7C5CFF]/25 blur-[140px]" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-[#31E981]/15 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="rise">
              <p className="eyebrow flex items-center gap-2 text-[color:var(--color-lime)]">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-[color:var(--color-lime)]" />
                {week.length} activities in the next 7 days
              </p>
              <h1 className="display mt-5 text-[13vw] leading-[0.85] text-[color:var(--color-chalk)] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
                WHAT&rsquo;S
                <br />
                <span className="bg-gradient-to-r from-[#7C5CFF] via-[#B892FF] to-[#31E981] bg-clip-text text-transparent">
                  HAPPENING?
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-[#9A99B5] sm:text-lg">
                Things to do, people to meet, matches to watch, places to explore.
                Everything happening around campus this week, in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-chalk)] px-6 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
                >
                  Explore campus
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-[color:var(--color-chalk)] transition hover:border-white/60"
                >
                  Host something
                </Link>
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white/8 sm:grid-cols-4">
                {[
                  { label: "Tonight", value: tonight.length },
                  { label: "This week", value: week.length },
                  { label: "This weekend", value: weekend.length },
                  { label: "Trending", value: trending.length },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[color:var(--color-ink)] px-4 py-4">
                    <dt className="eyebrow text-[#6B6B85]">{stat.label}</dt>
                    <dd className="display mt-1 text-2xl text-[color:var(--color-chalk)]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {hero ? (
              <Reveal delay={0.15}>
                <Link
                  href={`/events/${hero.slug}`}
                  className="card-hover group block overflow-hidden rounded-3xl border border-white/12 bg-[color:var(--color-surface)]/80 backdrop-blur"
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden">
                    <Image
                      src={hero.coverImage ?? heroCategory!.cover}
                      alt={hero.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 480px"
                      className="zoom-media object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent" />
                    <span
                      className="eyebrow absolute left-5 top-5 rounded-full px-3 py-1.5 text-[color:var(--color-ink)]"
                      style={{ background: heroCategory!.accent }}
                    >
                      {hero.tag ?? heroCategory!.label}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="eyebrow text-[#6B6B85]">Featured right now</p>
                    <h2 className="display mt-2 text-3xl leading-tight text-[color:var(--color-chalk)]">
                      {hero.title}
                    </h2>
                    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#9A99B5]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {formatDay(hero.startAt)} · {formatTime(hero.startAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {hero.venue}
                      </span>
                    </p>
                    <div className="mt-4">
                      <StatusPill info={getRegistrationInfo(hero)} />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* Happening soon */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <SectionHeading
          eyebrow="Happening soon"
          title="Next up around campus"
          description="The closest activities on the calendar. Grab a spot before they fill."
          href="/events"
          accent="#31E981"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 6).map((event, index) => (
            <Reveal key={event.id} delay={index * 0.05}>
              <EventCard
                event={event}
                saved={saved.has(event.id)}
                signedIn={signedIn}
                pathname="/"
                priority={index < 3}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* This week timeline */}
      <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-ink-soft)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <SectionHeading
            eyebrow="This week on campus"
            title="Seven days, one timeline"
            description="Monday to Sunday — everything approved and happening."
            accent="#FF8A3D"
          />
          <div className="space-y-10">
            {days.map((day) => (
              <Reveal key={day.date.toISOString()}>
                <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                  <div className="md:sticky md:top-28 md:self-start">
                    <p className="display text-2xl text-[color:var(--color-chalk)]">
                      {formatDay(day.date)}
                    </p>
                    <p className="text-sm text-[#6B6B85]">{formatShortDate(day.date)}</p>
                    <p className="eyebrow mt-2 text-[#6B6B85]">
                      {day.events.length} {day.events.length === 1 ? "activity" : "activities"}
                    </p>
                  </div>
                  <div className="space-y-3 border-l border-white/8 pl-5 md:pl-8">
                    {day.events.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        saved={saved.has(event.id)}
                        signedIn={signedIn}
                        pathname="/"
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
            {days.length === 0 ? (
              <p className="text-[#9A99B5]">No approved activities in the next seven days yet.</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <SectionHeading
          eyebrow="Trending"
          title="What everyone is saving"
          description="The activities collecting the most interest right now."
          href="/events?sort=trending"
          hrefLabel="See trending"
          accent="#B892FF"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((event, index) => (
            <Reveal key={event.id} delay={index * 0.05}>
              <EventCard
                event={event}
                saved={saved.has(event.id)}
                signedIn={signedIn}
                pathname="/"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sports strip */}
      <section className="relative overflow-hidden border-y border-[color:var(--color-line)] bg-[color:var(--color-ink-soft)]">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#31E981]/12 blur-[130px]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <SectionHeading
            eyebrow="Sports"
            title="Matches, results, tournaments"
            description="Semester derbies, department rivalries and the futsal cup."
            href="/sports"
            hrefLabel="Sports hub"
            accent="#31E981"
          />
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((event) => (
                <MatchCard key={event.id} event={event} />
              ))}
            </div>
            <div className="rounded-3xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-6">
              <p className="eyebrow flex items-center gap-2 text-[color:var(--color-lime)]">
                <Trophy className="h-4 w-4" />
                Recent results
              </p>
              <ul className="mt-5 space-y-4">
                {results.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-4 py-3 transition hover:border-white/25"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-[#C9C7E0]">
                        {event.match?.teamA}
                      </span>
                      <span className="display shrink-0 text-base text-[color:var(--color-chalk)]">
                        {event.match?.scoreA} — {event.match?.scoreB}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-right text-sm text-[#C9C7E0]">
                        {event.match?.teamB}
                      </span>
                    </Link>
                  </li>
                ))}
                {results.length === 0 ? (
                  <li className="text-sm text-[#6B6B85]">No results recorded yet.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
        <SectionHeading
          eyebrow="Explore"
          title="Pick a scene"
          description="Every category has its own corner of campus."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_LIST.map((category, index) => (
            <Reveal key={category.key} delay={index * 0.04}>
              <CategoryTile
                category={category}
                count={counts.get(category.key) ?? 0}
                large={index === 0}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Organize CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--color-line)] bg-gradient-to-br from-[#171730] via-[#111120] to-[#0B0B14] p-8 md:p-14">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#7C5CFF]/25 blur-[120px]" />
          <div className="relative max-w-2xl">
            <p className="eyebrow flex items-center gap-2 text-[color:var(--color-violet)]">
              <Sparkles className="h-4 w-4" />
              Organize
            </p>
            <h2 className="display mt-3 text-4xl leading-[1.02] text-[color:var(--color-chalk)] md:text-6xl">
              Got an idea? Put it on the campus map.
            </h2>
            <p className="mt-4 text-[#9A99B5]">
              Publish a match, a trip, a jam session or a workshop. Attach your Google Form
              for registrations, track spots, and let the whole campus find it once an
              admin approves.
            </p>
            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-chalk)] px-6 py-3 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white"
            >
              Create an event
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
