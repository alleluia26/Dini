"use client";

import type { AdminActionState } from "@/app/actions/admin";

export function ActionFeedback({ state }: { state: AdminActionState }) {
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

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;

  return (
    <p className="mt-1 text-sm font-medium text-[var(--color-error)]">{errors[0]}</p>
  );
}
