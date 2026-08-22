"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { saveCategory, type AdminActionState } from "@/app/actions/admin";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { MediaUpload } from "@/components/admin/media-upload";

const initialState: AdminActionState = {};

export type CategoryFormData = {
  active: boolean;
  description: string | null;
  id: string;
  imageAssetId: string | null;
  name: string;
  slug: string;
};

type CategoryFormProps = {
  category?: {
    active: boolean;
    description: string | null;
    id: string;
    imageAssetId: string | null;
    name: string;
    slug: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function CategoryForm({ category, onCancel, onSuccess }: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(saveCategory, initialState);
  const [imageAssetId, setImageAssetId] = useState(category?.imageAssetId ?? "");
  const successHandled = useRef(false);

  useEffect(() => {
    if (!state.success) {
      successHandled.current = false;
      return;
    }

    if (!successHandled.current) {
      successHandled.current = true;
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <input name="id" type="hidden" value={category?.id ?? ""} />
      <input name="imageAssetId" type="hidden" value={imageAssetId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="category-name">
            Name
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={category?.name}
            id="category-name"
            name="name"
            required
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="category-slug">
            Slug
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={category?.slug}
            id="category-slug"
            name="slug"
            required
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="category-description">
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={category?.description ?? ""}
          id="category-description"
          name="description"
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>
      <div>
        <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
          <input
            defaultChecked={category?.active ?? true}
            name="active"
            type="checkbox"
          />{" "}
          Active on the menu
        </label>
      </div>
      <MediaUpload
        label="Category image"
        name="category-image"
        onUploaded={(asset) => setImageAssetId(asset.id)}
        value={imageAssetId}
      />
      <ActionFeedback state={state} />
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <button
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-5 text-sm font-bold disabled:opacity-60"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
        <button
          className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 text-sm font-extrabold text-white disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving…" : category ? "Save category" : "Create category"}
        </button>
      </div>
    </form>
  );
}
