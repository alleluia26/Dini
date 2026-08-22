"use client";

import { useActionState, useState } from "react";

import { login, type LoginFormState } from "@/app/actions/auth";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-[var(--color-ink)]"
          htmlFor="email"
        >
          Email address
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] shadow-sm transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-blue)] focus:outline-none"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-bold text-[var(--color-ink)]"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 pr-12 text-[var(--color-ink)] shadow-sm transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-blue)] focus:outline-none"
            id="password"
            name="password"
            required
            type={passwordVisible ? "text" : "password"}
          />
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-[var(--radius-control)] text-[var(--color-muted)] transition hover:text-[var(--color-brand-blue)]"
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              viewBox="0 0 24 24"
              width="20"
            >
              <path
                d={
                  passwordVisible
                    ? "M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.7 10.7 0 0112 4c5.5 0 9.4 4.3 10 8-.3 1.8-1.6 4.1-3.8 5.8M6.2 6.2C4.2 7.8 2.7 10.1 2 12c.6 3.7 4.5 8 10 8 1 0 2-.1 2.9-.4"
                    : "M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z"
                }
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </div>

      {state.message ? (
        <p
          className="rounded-[var(--radius-control)] bg-red-50 px-4 py-3 text-sm font-semibold text-[var(--color-error)]"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-red-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
