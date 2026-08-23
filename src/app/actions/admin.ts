"use server";

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
    displayOrder: value(formData, "displayOrder"),
    imageAssetId: value(formData, "imageAssetId"),
    active: checked(formData, "active"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    const { displayOrder, id, ...categoryData } = parsed.data;
    await assertMediaAsset(categoryData.imageAssetId);

    if (id) {
      const existing = await prisma.category.findUnique({
        where: { id },
        select: { imageAssetId: true },
      });

      await prisma.category.update({
        where: { id },
        data: {
          ...categoryData,
          ...(displayOrder === null ? {} : { displayOrder }),
        },
      });

      if (existing?.imageAssetId !== categoryData.imageAssetId) {
        await deleteMediaAssetIfUnused(existing?.imageAssetId ?? null);
      }
    } else {
      await prisma.$transaction(async (transaction) => {
        if (displayOrder !== null) {
          await transaction.category.create({
            data: { ...categoryData, displayOrder },
          });
          return;
        }

        await transaction.$queryRaw`SELECT pg_advisory_xact_lock(719205)`;
        const lastCategory = await transaction.category.aggregate({
          _max: { displayOrder: true },
        });
        await transaction.category.create({
          data: {
            ...categoryData,
            displayOrder: (lastCategory._max.displayOrder ?? 0) + 1,
          },
        });
      });
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

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { _count: { select: { menuItems: true } } },
    });

    if (!category) return { message: "This category no longer exists." };
    if (category._count.menuItems > 0) {
      return {
        message: "Move or remove this category's menu items before deleting it.",
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidateMenuManagement();
    return { success: true, message: "Category deleted." };
  } catch {
    return { message: "This category could not be deleted." };
  }
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
    displayOrder: value(formData, "displayOrder"),
    imageAssetId: value(formData, "imageAssetId"),
    available: checked(formData, "available"),
    featured: checked(formData, "featured"),
    active: checked(formData, "active"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    const { displayOrder, id, ...menuItemData } = parsed.data;
    const category = await prisma.category.findUnique({
      where: { id: menuItemData.categoryId },
      select: { id: true },
    });

    if (!category) return { message: "Choose an existing category." };
    await assertMediaAsset(menuItemData.imageAssetId);

    if (id) {
      const existing = await prisma.menuItem.findUnique({
        where: { id },
        select: { imageAssetId: true },
      });

      await prisma.menuItem.update({
        where: { id },
        data: {
          ...menuItemData,
          ...(displayOrder === null ? {} : { displayOrder }),
        },
      });

      if (existing?.imageAssetId !== menuItemData.imageAssetId) {
        await deleteMediaAssetIfUnused(existing?.imageAssetId ?? null);
      }
    } else {
      await prisma.$transaction(async (transaction) => {
        if (displayOrder !== null) {
          await transaction.menuItem.create({
            data: { ...menuItemData, displayOrder },
          });
          return;
        }

        await transaction.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtext(${menuItemData.categoryId}))
        `;
        const lastMenuItem = await transaction.menuItem.aggregate({
          where: { categoryId: menuItemData.categoryId },
          _max: { displayOrder: true },
        });
        await transaction.menuItem.create({
          data: {
            ...menuItemData,
            displayOrder: (lastMenuItem._max.displayOrder ?? 0) + 1,
          },
        });
      });
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

  const parsed = settingsSchema.safeParse({
    hotelName: value(formData, "hotelName"),
    currency: value(formData, "currency"),
    menuEnabled: checked(formData, "menuEnabled"),
  });

  if (!parsed.success) return errors(parsed.error);

  try {
    await prisma.restaurantSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...parsed.data },
      update: parsed.data,
    });

    revalidateMenuManagement();
    return { success: true, message: "Settings saved." };
  } catch (error) {
    return databaseError(error);
  }
}
