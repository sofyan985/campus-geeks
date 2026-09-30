"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login, signup, type AuthState } from "@/app/actions/auth";
import { CAMPUS_EMAIL_DOMAIN, CAMPUS_NAME } from "@/lib/campus";
import { CATEGORY_LIST } from "@/lib/categories";

const emailPattern = `[^@\\s]+@${CAMPUS_EMAIL_DOMAIN.replace(/\./g, "\\.")}`;
const emailHint = `${CAMPUS_NAME} students only — use your @${CAMPUS_EMAIL_DOMAIN} address.`;

const inputClass =
  "w-full rounded-xl border border-white/12 bg-[#0B0B14] px-4 py-3 text-[color:var(--color-chalk)] outline-none transition placeholder:text-[#6B6B85] focus:border-white/50";

const labelClass = "eyebrow block text-[#6B6B85]";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[color:var(--color-chalk)] px-6 py-3.5 text-sm font-semibold text-[color:var(--color-ink)] transition hover:bg-white disabled:opacity-60"
    >
      {pending ? "Just a moment..." : label}
    </button>
  );
}

function ErrorNote({ state }: { state: AuthState }) {
  if (!state.error) return null;
  return (
    <p className="rounded-xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FF9E9E]">
      {state.error}
    </p>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, {} as AuthState);

  return (
    <form action={action} className="space-y-4">
      <ErrorNote state={state} />
      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email ?? "student@uetpeshawar.edu.pk"}
          key={state.values?.email ?? "default"}
          pattern={emailPattern}
          title={emailHint}
          className={`${inputClass} mt-2`}
        />
        <p className="mt-2 text-xs text-[#6B6B85]">{emailHint}</p>
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${inputClass} mt-2`}
        />
      </div>
      <Submit label="Sign in" />
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signup, {} as AuthState);
  const [interests, setInterests] = useState<string[]>(["sports", "music"]);

  function toggle(key: string) {
    setInterests((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <form action={action} className="space-y-4">
      <ErrorNote state={state} />
      <div>
        <label className={labelClass} htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={state.values?.name ?? ""}
          key={state.values?.name ?? "default-name"}
          className={`${inputClass} mt-2`}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            defaultValue={state.values?.email ?? ""}
            key={state.values?.email ?? "default-email"}
            pattern={emailPattern}
            title={emailHint}
            placeholder={`you@${CAMPUS_EMAIL_DOMAIN}`}
            className={`${inputClass} mt-2`}
          />
          <p className="mt-2 text-xs text-[#6B6B85]">{emailHint}</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="department">
            Department
          </label>
          <input
            id="department"
            name="department"
            placeholder="Computer Science"
            className={`${inputClass} mt-2`}
            defaultValue={state.values?.department ?? ""}
            key={state.values?.department ?? "default-department"}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="semester">
            Semester
          </label>
          <input
            id="semester"
            name="semester"
            placeholder="3"
            className={`${inputClass} mt-2`}
            defaultValue={state.values?.semester ?? ""}
            key={state.values?.semester ?? "default-semester"}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Interests</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_LIST.map((category) => {
            const selected = interests.includes(category.key);
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => toggle(category.key)}
                className="rounded-full border px-4 py-2 text-sm transition"
                style={
                  selected
                    ? {
                        borderColor: category.accent,
                        background: `${category.accent}22`,
                        color: category.accent,
                      }
                    : { borderColor: "rgba(255,255,255,0.12)", color: "#C9C7E0" }
                }
              >
                {category.label}
              </button>
            );
          })}
        </div>
        {interests.map((key) => (
          <input key={key} type="hidden" name="interests" value={key} />
        ))}
      </div>

      <Submit label="Create account" />
    </form>
  );
}
