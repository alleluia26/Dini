"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AdminInactivityTimeout } from "@/components/admin/admin-inactivity-timeout";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useLocalTheme } from "@/components/ui/theme-toggle";

type AdminShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AdminShell({ children }: AdminShellProps) {
  const { theme } = useLocalTheme("dini-admin-theme");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;

    lastFocusedElement.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusable = drawer?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      lastFocusedElement.current?.focus();
    };
  }, [drawerOpen]);

  function handleDrawerKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="min-h-screen bg-[var(--color-surface-soft)] lg:grid lg:grid-cols-[17rem_1fr]"
      data-admin-theme={theme}
    >
      <header
        aria-hidden={drawerOpen || undefined}
        className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 lg:hidden"
      >
        <Link
          className="flex w-fit items-center gap-3 rounded-[var(--radius-control)]"
          href="/admin"
        >
          <BrandLogo
            className="h-8 w-auto sm:h-9"
            sizes="(min-width: 640px) 36px, 32px"
          />
          <span className="text-sm font-extrabold tracking-[0.14em] text-[var(--color-ink)]">
            ADMIN
          </span>
        </Link>
        <button
          aria-controls="admin-mobile-drawer"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? "Close admin navigation" : "Open admin navigation"}
          className="grid min-h-11 min-w-11 place-items-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
          onClick={() => setDrawerOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="grid gap-1">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </header>

      <aside className="hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:block">
        <Link
          className="flex w-fit items-center gap-3 rounded-[var(--radius-control)]"
          href="/admin"
        >
          <BrandLogo
            className="h-10 w-auto xl:h-11"
            sizes="(min-width: 1280px) 44px, 40px"
          />
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

        <div className="mt-3">
          <LogoutButton />
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-[rgb(23_32_51_/_55%)]"
            onClick={closeDrawer}
            type="button"
          />
          <aside
            aria-label="Admin navigation"
            aria-modal="true"
            className="relative flex h-full w-[min(18rem,calc(100vw-3rem))] flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-elevated)]"
            id="admin-mobile-drawer"
            onKeyDown={handleDrawerKeyDown}
            ref={drawerRef}
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                className="flex w-fit items-center gap-3 rounded-[var(--radius-control)]"
                href="/admin"
                onClick={closeDrawer}
              >
                <BrandLogo
                  className="h-8 w-auto sm:h-9"
                  sizes="(min-width: 640px) 36px, 32px"
                />
                <span className="text-sm font-extrabold tracking-[0.14em] text-[var(--color-ink)]">
                  ADMIN
                </span>
              </Link>
              <button
                aria-label="Close admin navigation"
                className="grid min-h-11 min-w-11 place-items-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-xl leading-none text-[var(--color-ink)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
                onClick={closeDrawer}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <AdminNav onNavigate={closeDrawer} />

            <Link
              className="mt-8 inline-flex w-fit rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
              href="/menu"
              onClick={closeDrawer}
            >
              View public menu
            </Link>

            <div className="mt-3">
              <LogoutButton />
            </div>
          </aside>
        </div>
      ) : null}

      <main aria-hidden={drawerOpen || undefined} className="p-5 sm:p-8 lg:p-10">
        {children}
      </main>
      <AdminInactivityTimeout />
    </div>
  );
}
