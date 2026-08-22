import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { InitialAdminForm } from "@/components/admin/initial-admin-form";
import { BrandLogo } from "@/components/ui/brand-logo";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Initial administrator setup",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InitialAdminSetupPage() {
  const existingAdminCount = await prisma.adminUser.count();

  if (existingAdminCount > 0) {
    redirect("/admin/login");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-surface-soft)] p-5">
      <section className="w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card)] sm:p-10">
        <BrandLogo className="h-auto w-56" priority sizes="224px" />
        <p className="mt-8 text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
          INITIAL SETUP
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Create the first administrator
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
          This one-time setup is available only while no administrator account exists.
        </p>
        <InitialAdminForm />
      </section>
    </main>
  );
}
