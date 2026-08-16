"use client";

import { useActionState, useState } from "react";

import { saveSettings, type AdminActionState } from "@/app/actions/admin";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { MediaUpload } from "@/components/admin/media-upload";

const initialState: AdminActionState = {};

type SettingsFormProps = {
  settings: {
    hotelName: string;
    description: string | null;
    phone: string | null;
    address: string | null;
    openingHours: string | null;
    currency: string;
    socialLinks: unknown;
    menuEnabled: boolean;
    logoAssetId: string | null;
    coverAssetId: string | null;
  } | null;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const [logoAssetId, setLogoAssetId] = useState(settings?.logoAssetId ?? "");
  const [coverAssetId, setCoverAssetId] = useState(settings?.coverAssetId ?? "");

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <input name="logoAssetId" type="hidden" value={logoAssetId} />
      <input name="coverAssetId" type="hidden" value={coverAssetId} />
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
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="hotel-description">
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={settings?.description ?? ""}
          id="hotel-description"
          name="description"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="phone">
            Phone
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={settings?.phone ?? ""}
            id="phone"
            name="phone"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="hours">
            Opening hours
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={settings?.openingHours ?? ""}
            id="hours"
            name="openingHours"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="address">
          Address
        </label>
        <textarea
          className="min-h-20 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={settings?.address ?? ""}
          id="address"
          name="address"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="social-links">
          Social links (JSON)
        </label>
        <textarea
          className="min-h-24 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3 font-mono text-sm"
          defaultValue={JSON.stringify(settings?.socialLinks ?? {}, null, 2)}
          id="social-links"
          name="socialLinks"
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Example: {`{"instagram":"https://..."}`}
        </p>
        <FieldError errors={state.fieldErrors?.socialLinks} />
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
      <div className="grid gap-5 sm:grid-cols-2">
        <MediaUpload
          label="Logo image"
          name="logo-image"
          onUploaded={(asset) => setLogoAssetId(asset.id)}
          value={logoAssetId}
        />
        <MediaUpload
          label="Menu cover image"
          name="cover-image"
          onUploaded={(asset) => setCoverAssetId(asset.id)}
          value={coverAssetId}
        />
      </div>
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
