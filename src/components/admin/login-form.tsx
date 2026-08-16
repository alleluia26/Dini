"use client";

import { useActionState } from "react";

import { login, type LoginFormState } from "@/app/actions/auth";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

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
        <input
          autoComplete="current-password"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] shadow-sm transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-blue)] focus:outline-none"
          id="password"
          name="password"
          required
          type="password"
        />
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
