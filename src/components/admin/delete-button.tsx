"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { AdminActionState } from "@/app/actions/admin";

import { ActionFeedback } from "@/components/admin/action-feedback";

const initialState: AdminActionState = {};

type DeleteButtonProps = {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  entityName: string;
  id: string;
  label: string;
};

export function DeleteButton({ action, entityName, id, label }: DeleteButtonProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeDialog() {
    if (isPending) return;
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-bold text-[var(--color-error)] transition hover:bg-red-50 disabled:opacity-60"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        Delete
      </button>
      <dialog
        aria-labelledby={`delete-dialog-title-${id}`}
        className="m-auto w-[min(100%-2rem,28rem)] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-[var(--shadow-elevated)] backdrop:bg-[rgb(23_32_51_/_55%)]"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        ref={dialogRef}
      >
        <form action={formAction} className="p-6">
          <input name="id" type="hidden" value={id} />
          <h2 className="text-xl font-extrabold" id={`delete-dialog-title-${id}`}>
            Delete {label}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Are you sure you want to delete this {entityName}? This action cannot be
            undone.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-bold disabled:opacity-60"
              disabled={isPending}
              onClick={closeDialog}
              ref={cancelRef}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-error)] px-4 text-sm font-extrabold text-white disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
          <ActionFeedback state={state} />
        </form>
      </dialog>
    </>
  );
}
