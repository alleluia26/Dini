"use client";

import { type FormEvent, useActionState, useEffect, useRef } from "react";

import { saveCategory, type AdminActionState } from "@/app/actions/admin";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";

const initialState: AdminActionState = {};

function validateDisplayOrderInput(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const isValid = input.value === "" || /^[1-9]\d*$/.test(input.value);

  input.setCustomValidity(isValid ? "" : "Use a positive whole number.");
}

export type CategoryFormData = {
  active: boolean;
  description: string | null;
  displayOrder: number;
  id: string;
  name: string;
  slug: string;
};

type CategoryFormProps = {
  category?: {
    active: boolean;
    description: string | null;
    displayOrder: number;
    id: string;
    name: string;
    slug: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function CategoryForm({ category, onCancel, onSuccess }: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(saveCategory, initialState);
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
        <label
          className="mb-2 block text-sm font-bold"
          htmlFor="category-display-order"
        >
          Display Order
        </label>
        <input
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={
            category && category.displayOrder > 0 ? category.displayOrder : ""
          }
          id="category-display-order"
          inputMode="numeric"
          min="1"
          name="displayOrder"
          onInput={validateDisplayOrderInput}
          placeholder="1"
          step="1"
          type="number"
        />
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Lower numbers appear first. Leave empty to automatically place it last.
        </p>
        <FieldError errors={state.fieldErrors?.displayOrder} />
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
