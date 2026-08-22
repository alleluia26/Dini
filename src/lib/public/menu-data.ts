import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db/client";

export type PublicMenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  oldPrice: string | null;
  available: boolean;
  featured: boolean;
  image: { url: string; alt: string } | null;
};

export type PublicMenuCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: { url: string; alt: string } | null;
  items: PublicMenuItem[];
};

export type PublicMenuData =
  | { status: "unavailable" }
  | { status: "error" }
  | {
      status: "ready";
      settings: {
        hotelName: string;
        currency: string;
      };
      categories: PublicMenuCategory[];
      featuredItems: PublicMenuItem[];
    };

function toPublicMenuItem(item: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: { toFixed: (digits: number) => string };
  oldPrice: { toFixed: (digits: number) => string } | null;
  available: boolean;
  featured: boolean;
  imageAsset: { publicUrl: string } | null;
}): PublicMenuItem {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: item.price.toFixed(2),
    oldPrice: item.oldPrice?.toFixed(2) ?? null,
    available: item.available,
    featured: item.featured,
    image: item.imageAsset ? { url: item.imageAsset.publicUrl, alt: item.name } : null,
  };
}

export const getPublicMenuData = cache(async (): Promise<PublicMenuData> => {
  try {
    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
      select: {
        hotelName: true,
        currency: true,
        menuEnabled: true,
      },
    });

    if (!settings?.menuEnabled) {
      return { status: "unavailable" };
    }

    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        imageAsset: { select: { publicUrl: true } },
        menuItems: {
          where: { active: true },
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            price: true,
            oldPrice: true,
            available: true,
            featured: true,
            imageAsset: { select: { publicUrl: true } },
          },
        },
      },
    });

    const publicCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      image: category.imageAsset
        ? { url: category.imageAsset.publicUrl, alt: category.name }
        : null,
      items: category.menuItems.map(toPublicMenuItem),
    }));

    return {
      status: "ready",
      settings: {
        hotelName: settings.hotelName,
        currency: settings.currency,
      },
      categories: publicCategories,
      featuredItems: publicCategories
        .flatMap((category) => category.items)
        .filter((item) => item.featured),
    };
  } catch {
    return { status: "error" };
  }
});
