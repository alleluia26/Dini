"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { ThemeToggle, useLocalTheme } from "@/components/ui/theme-toggle";
import type {
  PublicMenuCategory,
  PublicMenuData,
  PublicMenuItem,
} from "@/lib/public/menu-data";

type ReadyMenuData = Extract<PublicMenuData, { status: "ready" }>;

function formatPrice(value: string, currency: string) {
  return `${currency} ${value}`;
}

function MenuImage({
  alt,
  className,
  src,
}: {
  alt: string;
  className: string;
  src: string | null;
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`${className} grid place-items-center bg-[var(--color-surface-soft)] text-3xl font-extrabold text-[var(--color-muted)]`}
      >
        —
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={720}
      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
      src={src}
      unoptimized
      width={720}
    />
  );
}

function MenuItemCard({
  currency,
  item,
  onSelect,
}: {
  currency: string;
  item: PublicMenuItem;
  onSelect: (item: PublicMenuItem) => void;
}) {
  return (
    <article className="menu-item-card group overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <button
        aria-label={`View details for ${item.name}`}
        className="block h-full w-full text-left"
        onClick={() => onSelect(item)}
        type="button"
      >
        <div className="relative h-48 overflow-hidden bg-[var(--color-surface-soft)]">
          <MenuImage
            alt={item.image?.alt ?? ""}
            className="menu-item-image h-full w-full object-cover"
            src={item.image?.url ?? null}
          />
          {item.featured ? (
            <span className="absolute top-4 left-4 rounded-full bg-[var(--color-brand-red)] px-3 py-1.5 text-xs font-extrabold tracking-[0.08em] text-white uppercase shadow-sm">
              Featured
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg leading-6 font-extrabold tracking-tight text-[var(--color-ink)] sm:text-xl">
              {item.name}
            </h3>
            <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--color-brand-red)_10%,transparent)] px-3 py-1 text-sm font-extrabold text-[var(--color-brand-red)]">
              {formatPrice(item.price, currency)}
            </span>
          </div>
          {item.description ? (
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              {item.description}
            </p>
          ) : null}
          {!item.available ? (
            <p className="pt-4 text-xs font-extrabold tracking-[0.08em] text-[var(--color-warning)] uppercase">
              Currently unavailable
            </p>
          ) : null}
        </div>
      </button>
    </article>
  );
}

function MenuItemDialog({
  currency,
  item,
  onClose,
}: {
  currency: string;
  item: PublicMenuItem | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);
  if (!item) return <dialog ref={dialogRef} />;
  return (
    <dialog
      aria-labelledby="menu-item-dialog-title"
      className="m-auto w-[min(100%-2rem,34rem)] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0 shadow-[var(--shadow-elevated)] backdrop:bg-[rgb(23_32_51_/_55%)]"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <article>
        <MenuImage
          alt={item.image?.alt ?? ""}
          className="h-60 w-full object-cover"
          src={item.image?.url ?? null}
        />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2
              className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]"
              id="menu-item-dialog-title"
            >
              {item.name}
            </h2>
            <p className="shrink-0 text-lg font-extrabold text-[var(--color-brand-red)]">
              {formatPrice(item.price, currency)}
            </p>
          </div>
          {item.oldPrice ? (
            <p className="mt-1 text-sm font-semibold text-[var(--color-muted)] line-through">
              {formatPrice(item.oldPrice, currency)}
            </p>
          ) : null}
          {item.description ? (
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
              {item.description}
            </p>
          ) : null}
          {!item.available ? (
            <p className="mt-5 rounded-[var(--radius-control)] bg-amber-50 px-4 py-3 text-sm font-bold text-[var(--color-warning)]">
              This item is currently unavailable.
            </p>
          ) : null}
          <button
            autoFocus
            className="mt-6 min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-brand-red)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-red-hover)]"
            onClick={onClose}
            type="button"
          >
            Close details
          </button>
        </div>
      </article>
    </dialog>
  );
}

function EmptyMenuState({ heading, text }: { heading: string; text: string }) {
  return (
    <main className="relative mx-auto grid min-h-screen max-w-2xl place-items-center px-5 py-8 sm:px-8">
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8">
        <ThemeToggle
          label="Menu appearance"
          storageKey="dini-public-theme"
          variant="switch"
          visuallyHiddenLabel
        />
      </div>
      <section className="w-full rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 text-center shadow-[var(--shadow-card)] sm:p-10">
        <p className="text-sm font-extrabold tracking-[0.18em] text-[var(--color-brand-red)] uppercase">
          Digital Menu
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
          {heading}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">{text}</p>
      </section>
    </main>
  );
}

export function MenuExperience({ data }: { data: PublicMenuData }) {
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const { theme } = useLocalTheme("dini-public-theme");
  if (data.status === "error")
    return (
      <div className="min-h-screen bg-[var(--color-canvas)]" data-public-theme={theme}>
        <EmptyMenuState
          heading="The menu is temporarily unavailable"
          text="Please try again shortly."
        />
      </div>
    );
  if (data.status === "unavailable")
    return (
      <div className="min-h-screen bg-[var(--color-canvas)]" data-public-theme={theme}>
        <EmptyMenuState
          heading="The digital menu is being prepared"
          text="Please return shortly to browse the latest selections."
        />
      </div>
    );
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]" data-public-theme={theme}>
      <ReadyMenuExperience
        data={data}
        onSelect={setSelectedItem}
        selectedItem={selectedItem}
      />
    </div>
  );
}

function ReadyMenuExperience({
  data,
  onSelect,
  selectedItem,
}: {
  data: ReadyMenuData;
  onSelect: (item: PublicMenuItem | null) => void;
  selectedItem: PublicMenuItem | null;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredCategories = useMemo(
    () =>
      data.categories
        .filter((category) => !activeCategory || category.id === activeCategory)
        .map((category) => ({
          ...category,
          items: normalizedQuery
            ? category.items.filter((item) =>
                [item.name, item.description ?? ""].some((value) =>
                  value.toLocaleLowerCase().includes(normalizedQuery),
                ),
              )
            : category.items,
        }))
        .filter((category) => category.items.length > 0),
    [activeCategory, data.categories, normalizedQuery],
  );
  const hasItems = data.categories.some((category) => category.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-canvas)]">
      <header className="border-b border-white/15 bg-[var(--color-brand-red)] shadow-sm">
        <div className="relative mx-auto flex max-w-7xl items-center px-4 py-1 sm:px-8 sm:py-1.5">
          <div className="flex min-w-0 items-center gap-2.5 pr-20 sm:gap-3">
            <Image
              alt="Dini Hotel"
              className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-13 sm:w-13"
              height={120}
              priority
              src="/brand/dini-hotel-logo.jpg"
              width={120}
            />
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-[0.12em] text-white uppercase sm:text-lg">
                Dini Hotel
              </p>
            </div>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 sm:right-8">
            <ThemeToggle
              compact
              label="Menu appearance"
              storageKey="dini-public-theme"
              variant="switch"
              visuallyHiddenLabel
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-red-950/10 bg-[var(--color-surface)]">
          <div className="absolute inset-x-0 top-0 -z-10 h-1 bg-[var(--color-brand-red)]" />
          <div className="absolute -top-24 -right-20 -z-10 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 -z-10 h-64 w-64 rounded-full bg-red-700/10 blur-3xl" />
          <div className="mx-auto max-w-7xl px-5 py-8 text-center sm:px-8 sm:py-10">
            <p className="text-xs font-extrabold tracking-[0.24em] text-[var(--color-brand-red)] uppercase sm:text-sm">
              Dini Hotel presents
            </p>
            <h1 className="mt-2 text-4xl leading-tight font-black tracking-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
              Welcome to{" "}
              <span className="text-[var(--color-brand-red)]">Dini Hotel</span> Menu
            </h1>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="text-center">
            <p className="text-xs font-extrabold tracking-[0.24em] text-[var(--color-brand-red)] uppercase">
              Explore our selection
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Digital Menu
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[var(--color-brand-red)]" />
          </div>
          {data.categories.length > 0 ? (
            <nav aria-label="Menu categories" className="mt-6">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
                <button
                  aria-pressed={!activeCategory}
                  className={`min-h-11 shrink-0 rounded-full px-5 py-2 text-sm font-extrabold transition ${!activeCategory ? "bg-[var(--color-brand-red)] text-white shadow-md" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)]"}`}
                  onClick={() => setActiveCategory(null)}
                  type="button"
                >
                  All
                </button>
                {data.categories.map((category) => {
                  const active = activeCategory === category.id;
                  return (
                    <button
                      aria-pressed={active}
                      className={`min-h-11 shrink-0 rounded-full px-5 py-2 text-sm font-extrabold transition ${active ? "bg-[var(--color-brand-red)] text-white shadow-md" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)]"}`}
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      type="button"
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </nav>
          ) : null}
          <section aria-label="Search the menu" className="mx-auto mt-5 max-w-xl">
            <label className="sr-only" htmlFor="menu-search">
              Search menu items
            </label>
            <input
              className="min-h-12 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-base shadow-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-brand-red)]"
              id="menu-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the menu"
              type="search"
              value={query}
            />
          </section>
          {!hasItems ? (
            <section className="mt-12 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <h2 className="text-xl font-extrabold">The menu is being prepared</h2>
              <p className="mt-3 text-[var(--color-muted)]">
                Please return shortly to browse the latest selections.
              </p>
            </section>
          ) : (
            <div className="mt-8 space-y-12">
              {filteredCategories.map((category: PublicMenuCategory) => (
                <section
                  aria-labelledby={`${category.slug}-heading`}
                  id={category.slug}
                  key={category.id}
                >
                  <div className="mb-6 flex items-center gap-4 sm:mb-8">
                    <div className="h-px flex-1 bg-[var(--color-brand-red)]/25" />
                    <div className="text-center">
                      <p className="text-xs font-extrabold tracking-[0.2em] text-[var(--color-brand-red)] uppercase">
                        Dini Hotel
                      </p>
                      <h2
                        className="mt-1 text-2xl font-black tracking-tight text-[var(--color-ink)] uppercase sm:text-3xl"
                        id={`${category.slug}-heading`}
                      >
                        {category.name}
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-[var(--color-brand-red)]/25" />
                  </div>
                  {category.description ? (
                    <p className="mx-auto -mt-4 mb-6 max-w-2xl text-center text-sm leading-6 text-[var(--color-muted)]">
                      {category.description}
                    </p>
                  ) : null}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {category.items.map((item) => (
                      <MenuItemCard
                        currency={data.settings.currency}
                        item={item}
                        key={item.id}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {normalizedQuery && filteredCategories.length === 0 ? (
            <section className="mt-12 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <h2 className="text-xl font-extrabold">No matching items</h2>
              <p className="mt-3 text-[var(--color-muted)]">
                Try a different search term or browse a category above.
              </p>
            </section>
          ) : null}
        </div>
      </main>
      <footer className="mt-auto bg-[var(--color-brand-red)] px-5 py-4 text-white sm:px-8">
        <p className="text-center text-sm font-semibold tracking-wide">
          © Dini Hotel. All right reserved
        </p>
      </footer>
      <MenuItemDialog
        currency={data.settings.currency}
        item={selectedItem}
        onClose={() => onSelect(null)}
      />
    </div>
  );
}
