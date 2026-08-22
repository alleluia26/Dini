"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { logout } from "@/app/actions/auth";
import { publishAdminSessionEvent } from "@/components/admin/admin-session-sync";

function LogoutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-4 text-sm font-extrabold text-white disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

function LogoutActions({
  cancelRef,
  onCancel,
}: {
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button
        className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-bold disabled:opacity-60"
        disabled={pending}
        onClick={onCancel}
        ref={cancelRef}
        type="button"
      >
        Cancel
      </button>
      <LogoutSubmit />
    </div>
  );
}

export function LogoutButton() {
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
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold text-[var(--color-muted)] transition hover:text-[var(--color-error)]"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        Log out
      </button>
      <dialog
        aria-labelledby="logout-dialog-title"
        className="m-auto w-[min(100%-2rem,28rem)] rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-[var(--shadow-elevated)] backdrop:bg-[rgb(23_32_51_/_55%)]"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        ref={dialogRef}
      >
        <form
          action={logout}
          className="p-6"
          onSubmit={() =>
            publishAdminSessionEvent({ occurredAt: Date.now(), type: "logout" })
          }
        >
          <h2 className="text-xl font-extrabold" id="logout-dialog-title">
            Log out?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Are you sure you want to log out?
          </p>
          <LogoutActions cancelRef={cancelRef} onCancel={closeDialog} />
        </form>
      </dialog>
    </>
  );
}
