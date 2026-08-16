import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/ui/brand-logo";

export const metadata: Metadata = {
  title: "Admin login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-surface-soft)] p-5">
      <section className="w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card)] sm:p-10">
        <BrandLogo priority />
        <p className="mt-8 text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
          ADMIN ACCESS
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Sign in to manage the menu
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
          Use your Dini Hotel administrator credentials.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
