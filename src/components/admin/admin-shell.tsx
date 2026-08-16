import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandLogo } from "@/components/ui/brand-logo";

type AdminShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:border-r lg:border-b-0">
        <Link
          className="flex w-fit items-center gap-3 rounded-[var(--radius-control)]"
          href="/admin"
        >
          <BrandLogo />
          <span className="text-sm font-extrabold tracking-[0.14em] text-[var(--color-ink)]">
            ADMIN
          </span>
        </Link>

        <AdminNav />

        <Link
          className="mt-8 inline-flex rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
          href="/menu"
        >
          View public menu
        </Link>

        <form action={logout} className="mt-3">
          <button
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold text-[var(--color-muted)] transition hover:text-[var(--color-error)]"
            type="submit"
          >
            Log out
          </button>
        </form>
      </aside>

      <main className="p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
