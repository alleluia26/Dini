"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  PublicMenuCategory,
  PublicMenuData,
  PublicMenuItem,
} from "@/lib/public/menu-data";
import { ThemeToggle, useLocalTheme } from "@/components/ui/theme-toggle";

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
        className={`${className} grid place-items-center bg-[var(--color-surface-soft)] text-2xl font-extrabold text-[var(--color-muted)]`}
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
      sizes="(min-width: 640px) 360px, 42vw"
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
    <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <button
        aria-label={`View details for ${item.name}`}
        className="grid w-full grid-cols-[6rem_minmax(0,1fr)] gap-4 p-3 text-left sm:grid-cols-[8.5rem_1fr]"
        onClick={() => onSelect(item)}
        type="button"
      >
        <MenuImage
          alt={item.image?.alt ?? ""}
          className="h-29 w-full rounded-[0.75rem] object-cover"
          src={item.image?.url ?? null}
        />
        <span className="min-w-0 py-1">
          <span className="flex items-start justify-between gap-3">
            <span className="text-base leading-5 font-extrabold text-[var(--color-ink)]">
              {item.name}
            </span>
            <span className="shrink-0 text-sm font-extrabold text-[var(--color-brand-red)]">
              {formatPrice(item.price, currency)}
            </span>
          </span>
          {item.description ? (
            <span className="mt-2 line-clamp-2 block text-sm leading-5 text-[var(--color-muted)]">
              {item.description}
            </span>
          ) : null}
          <span className="mt-3 flex flex-wrap gap-2">
            {item.featured ? (
              <span className="rounded-full bg-[var(--color-brand-blue-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-brand-blue)]">
                Featured
              </span>
            ) : null}
            {!item.available ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-[var(--color-warning)]">
                Currently unavailable
              </span>
            ) : null}
          </span>
        </span>
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
            className="mt-6 min-h-11 w-full rounded-[var(--radius-control)] bg-[var(--color-brand-blue)] px-5 py-3 text-sm font-extrabold text-white"
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
        <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
          DIGITAL MENU
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

  if (data.status === "error") {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)]" data-public-theme={theme}>
        <EmptyMenuState
          heading="The menu is temporarily unavailable"
          text="Please try again shortly."
        />
      </div>
    );
  }

  if (data.status === "unavailable") {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)]" data-public-theme={theme}>
        <EmptyMenuState
          heading="The digital menu is being prepared"
          text="Please return shortly to browse the latest selections."
        />
      </div>
    );
  }

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
  const filteredCategories = useMemo(() => {
    return data.categories
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
      .filter((category) => category.items.length > 0);
  }, [activeCategory, data.categories, normalizedQuery]);
  const featuredItems = normalizedQuery
    ? data.featuredItems.filter((item) =>
        [item.name, item.description ?? ""].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : data.featuredItems;
  const hasItems = data.categories.some((category) => category.items.length > 0);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-12">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Image
            alt={data.settings.hotelName}
            className="h-12 w-auto object-contain"
            height={120}
            priority
            src="/brand/dini-hotel-logo.jpg"
            style={{ width: "auto" }}
            width={180}
          />
          <p className="text-right text-xs font-extrabold tracking-[0.14em] text-[var(--color-brand-blue)]">
            DIGITAL MENU
          </p>
          <ThemeToggle
            label="Menu appearance"
            storageKey="dini-public-theme"
            variant="switch"
            visuallyHiddenLabel
          />
        </div>
      </header>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-brand-blue-soft)]">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 sm:grid-cols-[1fr_15rem] sm:items-center sm:px-8 sm:py-10">
          <div>
            <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
              WELCOME
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {data.settings.hotelName} menu
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {data.categories.length > 0 ? (
          <nav
            aria-label="Menu categories"
            className="-mx-5 border-b border-[var(--color-border)] px-5 py-4 sm:-mx-8 sm:px-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
              <button
                aria-pressed={!activeCategory}
                className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${!activeCategory ? "bg-[var(--color-brand-red)] text-white" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"}`}
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
                    className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${active ? "bg-[var(--color-brand-red)] text-white" : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"}`}
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

        <section aria-label="Search the menu" className="py-6">
          <label className="sr-only" htmlFor="menu-search">
            Search menu items
          </label>
          <input
            className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base shadow-sm placeholder:text-[var(--color-muted)]"
            id="menu-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu"
            type="search"
            value={query}
          />
        </section>

        {!hasItems ? (
          <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <h2 className="text-xl font-extrabold">The menu is being prepared</h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Please return shortly to browse the latest selections.
            </p>
          </section>
        ) : (
          <>
            {featuredItems.length > 0 ? (
              <section aria-labelledby="featured-heading" className="pb-10">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
                      HIGHLIGHTS
                    </p>
                    <h2
                      className="mt-1 text-2xl font-extrabold tracking-tight"
                      id="featured-heading"
                    >
                      Featured items
                    </h2>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredItems.map((item) => (
                    <MenuItemCard
                      currency={data.settings.currency}
                      item={item}
                      key={item.id}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="space-y-10">
              {filteredCategories.map((category: PublicMenuCategory) => (
                <section
                  aria-labelledby={`${category.slug}-heading`}
                  id={category.slug}
                  key={category.id}
                >
                  <div className="mb-4 flex items-start gap-4">
                    {category.image ? (
                      <MenuImage
                        alt={category.image.alt}
                        className="h-16 w-16 shrink-0 rounded-[var(--radius-control)] object-cover"
                        src={category.image.url}
                      />
                    ) : null}
                    <div>
                      <h2
                        className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]"
                        id={`${category.slug}-heading`}
                      >
                        {category.name}
                      </h2>
                      {category.description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
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
            {normalizedQuery && filteredCategories.length === 0 ? (
              <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                <h2 className="text-xl font-extrabold">No matching items</h2>
                <p className="mt-3 text-[var(--color-muted)]">
                  Try a different search term or browse a category above.
                </p>
              </section>
            ) : null}
          </>
        )}
      </div>
      <MenuItemDialog
        currency={data.settings.currency}
        item={selectedItem}
        onClose={() => onSelect(null)}
      />
    </main>
  );
}
