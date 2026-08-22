"use client";

import { useActionState } from "react";

import { saveSettings, type AdminActionState } from "@/app/actions/admin";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const initialState: AdminActionState = {};

type SettingsFormProps = {
  settings: {
    hotelName: string;
    currency: string;
    menuEnabled: boolean;
  } | null;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="hotel-name">
            Hotel name
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={settings?.hotelName}
            id="hotel-name"
            name="hotelName"
            required
          />
          <FieldError errors={state.fieldErrors?.hotelName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="currency">
            Currency
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={settings?.currency ?? "ETB"}
            id="currency"
            maxLength={3}
            name="currency"
            required
          />
          <FieldError errors={state.fieldErrors?.currency} />
        </div>
      </div>
      <fieldset>
        <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
          <input
            defaultChecked={settings?.menuEnabled ?? false}
            name="menuEnabled"
            type="checkbox"
          />{" "}
          Enable the public menu
        </label>
      </fieldset>
      <ThemeToggle
        label="Admin dashboard appearance"
        storageKey="dini-admin-theme"
        variant="switch"
      />
      <ActionFeedback state={state} />
      <button
        className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 text-sm font-extrabold text-white disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
