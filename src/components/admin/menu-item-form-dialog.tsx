"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  MenuItemForm,
  type CategoryOption,
  type MenuItemFormData,
} from "@/components/admin/menu-item-form";

type MenuItemFormDialogProps = {
  categories: CategoryOption[];
  defaultOpen?: boolean;
  item?: MenuItemFormData;
};

export function MenuItemFormDialog({
  categories,
  defaultOpen = false,
  item,
}: MenuItemFormDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function removeEditParam() {
    if (!searchParams.has("edit")) return;
    const params = new URLSearchParams(searchParams);
    params.delete("edit");
    router.replace(params.size ? `${pathname}?${params}` : pathname);
  }

  function closeDialog() {
    setOpen(false);
    removeEditParam();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleSuccess() {
    setOpen(false);
    removeEditParam();
    router.refresh();
  }

  return (
    <>
      {!item ? (
        <button
          className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 py-3 text-center text-sm font-extrabold text-white"
          onClick={() => setOpen(true)}
          ref={triggerRef}
          type="button"
        >
          Add Menu Item
        </button>
      ) : null}
      <dialog
        aria-labelledby="menu-item-form-dialog-title"
        className="m-auto max-h-[calc(100vh-2rem)] w-[min(100%-2rem,48rem)] overflow-y-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-[var(--shadow-elevated)] backdrop:bg-[rgb(23_32_51_/_55%)]"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        ref={dialogRef}
      >
        {open ? (
          <div className="p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-2xl font-extrabold"
                  id="menu-item-form-dialog-title"
                >
                  {item ? "Edit menu item" : "Add menu item"}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {item
                    ? "Update this menu item’s details."
                    : "Add a menu item to the public menu."}
                </p>
              </div>
              <button
                aria-label="Close menu item form"
                className="grid min-h-11 min-w-11 place-items-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-xl"
                onClick={closeDialog}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <MenuItemForm
              categories={categories}
              item={item}
              onCancel={closeDialog}
              onSuccess={handleSuccess}
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
