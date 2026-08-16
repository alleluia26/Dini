"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  void error;
  return (
    <section className="max-w-xl rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-6">
      <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-error)]">
        ADMIN ERROR
      </p>
      <h1 className="mt-2 text-2xl font-extrabold text-[var(--color-ink)]">
        This page could not load.
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
        Your data was not changed. Try loading the page again.
      </p>
      <button
        className="mt-5 min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-4 text-sm font-extrabold text-white"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
