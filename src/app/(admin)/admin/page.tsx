import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/db/client";

const metricLabels = [
  ["Total categories", "categories"],
  ["Total menu items", "items"],
  ["Active items", "active"],
  ["Unavailable items", "unavailable"],
  ["Featured items", "featured"],
] as const;

export default async function AdminDashboardPage() {
  const [categories, items, active, unavailable, featured] = await Promise.all([
    prisma.category.count(),
    prisma.menuItem.count(),
    prisma.menuItem.count({ where: { active: true } }),
    prisma.menuItem.count({ where: { available: false } }),
    prisma.menuItem.count({ where: { featured: true } }),
  ]);
  const values = [categories, items, active, unavailable, featured];

  return (
    <AdminShell>
      <section className="max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
              ADMIN DASHBOARD
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
              Menu management dashboard
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
              Keep the digital menu organised and ready for guests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 py-3 text-center text-sm font-extrabold text-white"
              href="/admin/menu-items#menu-item-form"
            >
              Add Menu Item
            </Link>
            <Link
              className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-blue)] px-5 py-3 text-center text-sm font-extrabold text-white"
              href="/admin/categories#category-form"
            >
              Add Category
            </Link>
          </div>
        </header>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          {metricLabels.map(([label, suffix], index) => (
            <article
              className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm sm:p-5"
              key={suffix}
            >
              <p className="text-xs leading-5 font-bold text-[var(--color-muted)] sm:text-sm">
                {label}
              </p>
              <p className="mt-2 text-2xl font-extrabold tracking-tight sm:mt-3 sm:text-3xl">
                {values[index]}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-5 py-3 text-center text-sm font-extrabold"
            href="/admin/menu-items"
          >
            Manage Menu
          </Link>
          <Link
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-5 py-3 text-center text-sm font-extrabold"
            href="/admin/settings"
          >
            Manage Settings
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
