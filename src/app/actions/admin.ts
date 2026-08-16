"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateMenuManagement } from "@/lib/admin/revalidation";
import { prisma } from "@/lib/db/client";
import { deleteMediaAssetIfUnused } from "@/lib/storage/media-assets";
import { categorySchema, menuItemSchema, settingsSchema } from "@/lib/validation/admin";

export type AdminActionState = {
  fieldErrors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const emptyState: AdminActionState = {};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function errors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return { fieldErrors: error.flatten().fieldErrors };
}

function databaseError(error: unknown): AdminActionState {
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return { message: "That unique value is already in use." };
  }

  return { message: "We could not save those changes. Please try again." };
}

async function assertMediaAsset(id: string | null) {
  if (!id) return;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!asset) {
    throw new Error("The selected image no longer exists.");
  }
}

export async function saveCategory(
  previousState: AdminActionState = emptyState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    id: value(formData, "id") || undefined,
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    imageAssetId: value(formData, "imageAssetId"),
    displayOrder: value(formData, "displayOrder"),
    active: checked(formData, "active"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    await assertMediaAsset(parsed.data.imageAssetId);

    if (parsed.data.id) {
      const existing = await prisma.category.findUnique({
        where: { id: parsed.data.id },
        select: { imageAssetId: true },
      });

      await prisma.category.update({
        where: { id: parsed.data.id },
        data: parsed.data,
      });

      if (existing?.imageAssetId !== parsed.data.imageAssetId) {
        await deleteMediaAssetIfUnused(existing?.imageAssetId ?? null);
      }
    } else {
      const { id, ...data } = parsed.data;
      void id;
      await prisma.category.create({ data });
    }

    revalidateMenuManagement();
    return { success: true, message: "Category saved." };
  } catch (error) {
    return databaseError(error);
  }
}

export async function deleteCategory(
  previousState: AdminActionState = emptyState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdmin();
  const id = value(formData, "id");

  if (!id) return { message: "Choose a category to delete." };

  const category = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { menuItems: true } } },
  });

  if (!category) return { message: "This category no longer exists." };
  if (category._count.menuItems > 0) {
    return { message: "Move or remove this category's menu items before deleting it." };
  }

  await prisma.category.delete({ where: { id } });
  revalidateMenuManagement();
  return { success: true, message: "Category deleted." };
}

export async function saveMenuItem(
  previousState: AdminActionState = emptyState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdmin();

  const parsed = menuItemSchema.safeParse({
    id: value(formData, "id") || undefined,
    categoryId: value(formData, "categoryId"),
    name: value(formData, "name"),
    slug: value(formData, "slug"),
    description: value(formData, "description"),
    price: value(formData, "price"),
    oldPrice: value(formData, "oldPrice"),
    imageAssetId: value(formData, "imageAssetId"),
    available: checked(formData, "available"),
    featured: checked(formData, "featured"),
    active: checked(formData, "active"),
    displayOrder: value(formData, "displayOrder"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });

    if (!category) return { message: "Choose an existing category." };
    await assertMediaAsset(parsed.data.imageAssetId);

    if (parsed.data.id) {
      const existing = await prisma.menuItem.findUnique({
        where: { id: parsed.data.id },
        select: { imageAssetId: true },
      });

      await prisma.menuItem.update({
        where: { id: parsed.data.id },
        data: parsed.data,
      });

      if (existing?.imageAssetId !== parsed.data.imageAssetId) {
        await deleteMediaAssetIfUnused(existing?.imageAssetId ?? null);
      }
    } else {
      const { id, ...data } = parsed.data;
      void id;
      await prisma.menuItem.create({ data });
    }

    revalidateMenuManagement();
    return { success: true, message: "Menu item saved." };
  } catch (error) {
    return databaseError(error);
  }
}

export async function deleteMenuItem(
  previousState: AdminActionState = emptyState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdmin();
  const id = value(formData, "id");

  if (!id) return { message: "Choose a menu item to delete." };

  try {
    await prisma.menuItem.delete({ where: { id } });
    revalidateMenuManagement();
    return { success: true, message: "Menu item deleted." };
  } catch {
    return { message: "This menu item could not be deleted." };
  }
}

export async function saveSettings(
  previousState: AdminActionState = emptyState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  await requireAdmin();

  let socialLinks: unknown = {};

  try {
    socialLinks = JSON.parse(value(formData, "socialLinks") || "{}");
  } catch {
    return { fieldErrors: { socialLinks: ["Enter valid JSON with URL values."] } };
  }

  const parsed = settingsSchema.safeParse({
    hotelName: value(formData, "hotelName"),
    description: value(formData, "description"),
    phone: value(formData, "phone"),
    address: value(formData, "address"),
    openingHours: value(formData, "openingHours"),
    currency: value(formData, "currency"),
    socialLinks,
    menuEnabled: checked(formData, "menuEnabled"),
    logoAssetId: value(formData, "logoAssetId"),
    coverAssetId: value(formData, "coverAssetId"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    await Promise.all([
      assertMediaAsset(parsed.data.logoAssetId),
      assertMediaAsset(parsed.data.coverAssetId),
    ]);

    const previous = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
      select: { coverAssetId: true, logoAssetId: true },
    });

    await prisma.restaurantSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...parsed.data },
      update: parsed.data,
    });

    if (previous?.logoAssetId !== parsed.data.logoAssetId) {
      await deleteMediaAssetIfUnused(previous?.logoAssetId ?? null);
    }

    if (previous?.coverAssetId !== parsed.data.coverAssetId) {
      await deleteMediaAssetIfUnused(previous?.coverAssetId ?? null);
    }

    revalidateMenuManagement();
    revalidatePath("/settings");
    return { success: true, message: "Settings saved." };
  } catch (error) {
    return databaseError(error);
  }
}
