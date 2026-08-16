"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/app/actions/admin";

import { ActionFeedback } from "@/components/admin/action-feedback";

const initialState: AdminActionState = {};

type DeleteButtonProps = {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  id: string;
  label: string;
};

export function DeleteButton({ action, id, label }: DeleteButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input name="id" type="hidden" value={id} />
      <button
        className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-bold text-[var(--color-error)] transition hover:bg-red-50 disabled:opacity-60"
        disabled={isPending}
        onClick={(event) => {
          if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
            event.preventDefault();
          }
        }}
        type="submit"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      <ActionFeedback state={state} />
    </form>
  );
}
