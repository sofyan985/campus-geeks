"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="eyebrow text-[color:var(--color-violet)]">Something broke</p>
      <h1 className="display mt-3 text-4xl leading-[0.95] text-[color:var(--color-chalk)] md:text-6xl">
        This page could not load
      </h1>
      <p className="mt-4 text-[#9A99B5]">
        Usually this means the campus database is unreachable. Try again in a moment.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[color:var(--color-chalk)] px-5 py-3 text-sm font-semibold text-[color:var(--color-ink)]"
        >
          Try again
        </button>
        <Link href="/" className="rounded-full border border-white/15 px-5 py-3 text-sm text-[#C9C7E0]">
          Back home
        </Link>
      </div>
    </div>
  );
}
