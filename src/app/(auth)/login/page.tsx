import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/feed");

  return (
    <div className="grain relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow text-[color:var(--color-violet)]">Welcome back</p>
        <h1 className="display mt-3 text-5xl leading-[0.95] text-[color:var(--color-chalk)] md:text-7xl">
          Sign in and see
          <br />
          your campus
        </h1>
        <p className="mt-4 max-w-md text-[#9A99B5]">
          Save events, follow societies and keep track of everything you signed up for.
        </p>

        <div className="mt-8 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5 text-sm">
          <p className="eyebrow text-[#6B6B85]">Demo accounts</p>
          <ul className="mt-3 space-y-1.5 text-[#C9C7E0]">
            <li>admin@uetpeshawar.edu.pk — admin dashboard</li>
            <li>organizer@uetpeshawar.edu.pk — society organizer</li>
            <li>student@uetpeshawar.edu.pk — student</li>
          </ul>
          <p className="mt-3 text-[#6B6B85]">Password for all three: campus1234</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-7 md:p-10">
        <Image
          src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=70"
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover opacity-10"
        />
        <div className="relative">
          <LoginForm />
          <p className="mt-6 text-sm text-[#9A99B5]">
            New here?{" "}
            <Link href="/signup" className="text-[color:var(--color-chalk)] underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
