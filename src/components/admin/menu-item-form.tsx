"use client";

import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";

import { saveMenuItem, type AdminActionState } from "@/app/actions/admin";
import { ActionFeedback, FieldError } from "@/components/admin/action-feedback";
import { MediaUpload } from "@/components/admin/media-upload";

const initialState: AdminActionState = {};

function validateDisplayOrderInput(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const isValid = input.value === "" || /^[1-9]\d*$/.test(input.value);

  input.setCustomValidity(isValid ? "" : "Use a positive whole number.");
}

export type CategoryOption = { id: string; name: string };
export type MenuItemFormData = {
  active: boolean;
  available: boolean;
  categoryId: string;
  description: string | null;
  displayOrder: number;
  featured: boolean;
  id: string;
  imageAssetId: string | null;
  name: string;
  price: string;
  slug: string;
};

type MenuItemFormProps = {
  categories: CategoryOption[];
  item?: MenuItemFormData;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function MenuItemForm({
  categories,
  item,
  onCancel,
  onSuccess,
}: MenuItemFormProps) {
  const [state, formAction, isPending] = useActionState(saveMenuItem, initialState);
  const [imageAssetId, setImageAssetId] = useState(item?.imageAssetId ?? "");
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
      <input name="id" type="hidden" value={item?.id ?? ""} />
      <input name="imageAssetId" type="hidden" value={imageAssetId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="item-name">
            Name
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={item?.name}
            id="item-name"
            name="name"
            required
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="item-slug">
            Slug
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={item?.slug}
            id="item-slug"
            name="slug"
            required
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="item-category">
          Category
        </label>
        <select
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={item?.categoryId}
          id="item-category"
          name="categoryId"
          required
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError errors={state.fieldErrors?.categoryId} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-bold" htmlFor="item-description">
          Description
        </label>
        <textarea
          className="min-h-24 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
          defaultValue={item?.description ?? ""}
          id="item-description"
          name="description"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="item-price">
            Price
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={item?.price}
            id="item-price"
            inputMode="decimal"
            name="price"
            required
          />
          <FieldError errors={state.fieldErrors?.price} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold" htmlFor="item-display-order">
            Display Order
          </label>
          <input
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-3"
            defaultValue={item && item.displayOrder > 0 ? item.displayOrder : ""}
            id="item-display-order"
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
      </div>
      <fieldset className="flex flex-wrap gap-x-6 gap-y-3">
        <legend className="sr-only">Menu item status</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
          <input
            defaultChecked={item?.available ?? true}
            name="available"
            type="checkbox"
          />{" "}
          Available
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
          <input
            defaultChecked={item?.featured ?? false}
            name="featured"
            type="checkbox"
          />{" "}
          Featured
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
          <input defaultChecked={item?.active ?? true} name="active" type="checkbox" />{" "}
          Active
        </label>
      </fieldset>
      <MediaUpload
        label="Menu item image"
        name="item-image"
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
          {isPending ? "Saving…" : item ? "Save menu item" : "Create menu item"}
        </button>
      </div>
    </form>
  );
}
