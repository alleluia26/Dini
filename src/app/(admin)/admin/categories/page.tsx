import Link from "next/link";

import { deleteCategory } from "@/app/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { prisma } from "@/lib/db/client";

type CategoriesPageProps = { searchParams: Promise<{ edit?: string; q?: string }> };

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { edit, q = "" } = await searchParams;
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
  const [categories, selected] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      include: { _count: { select: { menuItems: true } } },
    }),
    edit ? prisma.category.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
              MENU STRUCTURE
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Categories</h1>
            <p className="mt-3 text-[var(--color-muted)]">
              Create, order, and control the categories shown on the menu.
            </p>
          </div>
          <CategoryFormDialog />
        </header>
        {selected ? <CategoryFormDialog category={selected} defaultOpen /> : null}
        <form className="flex gap-3" action="/admin/categories">
          <label className="sr-only" htmlFor="category-search">
            Search categories
          </label>
          <input
            className="min-h-11 flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4"
            defaultValue={q}
            id="category-search"
            name="q"
            placeholder="Search categories"
          />
          <button className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-bold">
            Search
          </button>
        </form>
        {categories.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-muted)]">
            No categories yet. Use Add Category to create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full min-w-175 text-left text-sm">
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={category.id}
                  >
                    <td className="px-5 py-4">
                      <p className="font-extrabold">{category.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        /{category.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${category.active ? "bg-emerald-50 text-[var(--color-success)]" : "bg-slate-100 text-[var(--color-muted)]"}`}
                      >
                        {category.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{category._count.menuItems}</td>
                    <td className="px-5 py-4">{category.displayOrder}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          className="min-h-11 rounded-[var(--radius-control)] px-3 py-3 font-bold text-[var(--color-brand-blue)]"
                          href={`/admin/categories?edit=${category.id}`}
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteCategory}
                          entityName="category"
                          id={category.id}
                          label={category.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
