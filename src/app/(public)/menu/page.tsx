import type { Metadata } from "next";

import { BrandLogo } from "@/components/ui/brand-logo";

export const metadata: Metadata = {
  title: "Digital Menu",
  description: "Explore the Dini Hotel digital menu.",
};

export default function MenuPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-12">
      <header className="flex items-center justify-between">
        <BrandLogo priority />
        <p className="text-right text-xs font-extrabold tracking-[0.16em] text-[var(--color-brand-blue)]">
          DIGITAL MENU
        </p>
      </header>

      <section className="my-auto rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card)] sm:p-10">
        <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
          WELCOME
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Dini Hotel digital menu
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-[var(--color-muted)]">
          Our menu is being prepared. Please return shortly to browse the latest
          selections.
        </p>
      </section>
    </main>
  );
}
