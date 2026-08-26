"use client";

import { useActionState } from "react";

import {
  changeAdminPassword,
  type AccountActionState,
  updateAdminEmail,
} from "@/app/actions/account";

const initialState: AccountActionState = {};

function AccountFeedback({ state }: { state: AccountActionState }) {
  if (!state.message) return null;

  return (
    <p
      className={`rounded-[var(--radius-control)] px-4 py-3 text-sm font-semibold ${
        state.success
          ? "bg-emerald-50 text-[var(--color-success)]"
          : "bg-red-50 text-[var(--color-error)]"
      }`}
      role={state.success ? "status" : "alert"}
    >
      {state.message}
    </p>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;

  return (
    <p className="mt-1 text-sm font-medium text-[var(--color-error)]">{errors[0]}</p>
  );
}

export function AccountSecuritySettings({ currentEmail }: { currentEmail: string }) {
  const [emailState, emailAction, emailPending] = useActionState(
    updateAdminEmail,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changeAdminPassword,
    initialState,
  );

  return (
    <section aria-labelledby="account-security-heading" className="space-y-5">
      <div>
        <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
          ACCOUNT SECURITY
        </p>
        <h2
          className="mt-2 text-2xl font-extrabold tracking-tight"
          id="account-security-heading"
        >
          Sign-in details
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Confirm your current password before changing your email address or password.
        </p>
      </div>

      <form
        action={emailAction}
        className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
      >
        <div>
          <h3 className="text-lg font-extrabold">Update email</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Current email:{" "}
            <span className="font-semibold text-[var(--color-ink)]">
              {currentEmail}
            </span>
          </p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="new-email">
            New email address
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            id="new-email"
            name="email"
            required
            type="email"
          />
          <FieldError errors={emailState.fieldErrors?.email} />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold"
            htmlFor="email-current-password"
          >
            Current password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            id="email-current-password"
            name="currentPassword"
            required
            type="password"
          />
          <FieldError errors={emailState.fieldErrors?.currentPassword} />
        </div>
        <AccountFeedback state={emailState} />
        <button
          className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 text-sm font-extrabold text-white disabled:opacity-60"
          disabled={emailPending}
          type="submit"
        >
          {emailPending ? "Updating…" : "Update email"}
        </button>
      </form>

      <form
        action={passwordAction}
        className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
      >
        <div>
          <h3 className="text-lg font-extrabold">Change password</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Use a unique password with at least 12 characters.
          </p>
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold"
            htmlFor="password-current-password"
          >
            Current password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            id="password-current-password"
            name="currentPassword"
            required
            type="password"
          />
          <FieldError errors={passwordState.fieldErrors?.currentPassword} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="new-password">
            New password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            id="new-password"
            minLength={12}
            name="newPassword"
            required
            type="password"
          />
          <FieldError errors={passwordState.fieldErrors?.newPassword} />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold"
            htmlFor="password-confirmation"
          >
            Confirm new password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            id="password-confirmation"
            minLength={12}
            name="passwordConfirmation"
            required
            type="password"
          />
          <FieldError errors={passwordState.fieldErrors?.passwordConfirmation} />
        </div>
        <AccountFeedback state={passwordState} />
        <button
          className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 text-sm font-extrabold text-white disabled:opacity-60"
          disabled={passwordPending}
          type="submit"
        >
          {passwordPending ? "Changing…" : "Change password"}
        </button>
      </form>
    </section>
  );
}
