"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/menu-items", label: "Menu Items" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="mt-8">
      <ul className="space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                className={`block min-h-11 rounded-[var(--radius-control)] px-4 py-3 text-sm font-bold transition ${active ? "bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)]" : "text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]"}`}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
