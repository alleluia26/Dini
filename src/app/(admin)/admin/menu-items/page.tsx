import Link from "next/link";
import Image from "next/image";

import { deleteMenuItem } from "@/app/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteButton } from "@/components/admin/delete-button";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { prisma } from "@/lib/db/client";

type MenuItemsPageProps = {
  searchParams: Promise<{
    edit?: string;
    q?: string;
    category?: string;
    available?: string;
    active?: string;
    featured?: string;
  }>;
};

export default async function MenuItemsPage({ searchParams }: MenuItemsPageProps) {
  const params = await searchParams;
  const where = {
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.available ? { available: params.available === "true" } : {}),
    ...(params.active ? { active: params.active === "true" } : {}),
    ...(params.featured ? { featured: params.featured === "true" } : {}),
  };
  const [categories, items, selected] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.menuItem.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        category: { select: { name: true } },
        imageAsset: { select: { publicUrl: true } },
      },
    }),
    params.edit ? prisma.menuItem.findUnique({ where: { id: params.edit } }) : null,
  ]);
  const formItem = selected
    ? {
        ...selected,
        price: selected.price.toFixed(2),
        oldPrice: selected.oldPrice?.toFixed(2) ?? null,
      }
    : undefined;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
            MENU MANAGEMENT
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Menu items</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Keep pricing, availability, feature status, and ordering current.
          </p>
        </header>
        {categories.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-warning)] bg-amber-50 p-5 text-sm font-semibold text-[var(--color-warning)]">
            Create a category before adding a menu item.
          </div>
        ) : (
          <MenuItemForm categories={categories} item={formItem} />
        )}
        <form
          className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-6"
          action="/admin/menu-items"
        >
          <input
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3"
            defaultValue={params.q}
            name="q"
            placeholder="Search menu items"
          />
          <select
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3"
            defaultValue={params.category}
            name="category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3"
            defaultValue={params.available}
            name="available"
          >
            <option value="">Any availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <select
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3"
            defaultValue={params.featured}
            name="featured"
          >
            <option value="">Any feature status</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
          <select
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3"
            defaultValue={params.active}
            name="active"
          >
            <option value="">Any active status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-blue)] px-4 text-sm font-extrabold text-white">
            Filter
          </button>
        </form>
        {items.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[var(--color-muted)]">
            No menu items match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-t border-[var(--color-border)]" key={item.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageAsset ? (
                          <Image
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                            height={40}
                            unoptimized
                            width={40}
                            src={item.imageAsset.publicUrl}
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-surface-soft)] text-xs">
                            —
                          </span>
                        )}
                        <div>
                          <p className="font-extrabold">{item.name}</p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            /{item.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{item.category.name}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold">{item.price.toFixed(2)}</p>
                      {item.oldPrice ? (
                        <p className="text-xs text-[var(--color-muted)] line-through">
                          {item.oldPrice.toFixed(2)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.active ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-[var(--color-success)]">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                            Inactive
                          </span>
                        )}
                        {!item.available ? (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-[var(--color-warning)]">
                            Unavailable
                          </span>
                        ) : null}
                        {item.featured ? (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                            Featured
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">{item.displayOrder}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          className="min-h-11 rounded-[var(--radius-control)] px-3 py-3 font-bold text-[var(--color-brand-blue)]"
                          href={`/admin/menu-items?edit=${item.id}`}
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteMenuItem}
                          id={item.id}
                          label={item.name}
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
