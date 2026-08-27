import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(2_000)
  .transform((value) => value || null);

const optionalId = z
  .string()
  .trim()
  .cuid()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || null);

const decimal = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Use a non-negative amount with up to two decimals.")
  .refine((value) => Number(value) <= 99_999_999.99, "Amount is too large.");

const optionalDisplayOrder = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(
    z.union([
      z.null(),
      z
        .string()
        .regex(/^[1-9]\d*$/, "Use a positive whole number.")
        .transform(Number)
        .pipe(z.number().int().positive().max(2_147_483_647)),
    ]),
  );

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.")
    .max(120),
  description: optionalText,
  displayOrder: optionalDisplayOrder,
  active: z.boolean(),
});

export const menuItemSchema = z.object({
  id: z.string().cuid().optional(),
  categoryId: z.string().cuid(),
  name: z.string().trim().min(2).max(140),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.")
    .max(160),
  description: optionalText,
  price: decimal,
  displayOrder: optionalDisplayOrder,
  imageAssetId: optionalId,
  available: z.boolean(),
  featured: z.boolean(),
  active: z.boolean(),
});

export const settingsSchema = z.object({
  hotelName: z.string().trim().min(2).max(120),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a three-letter currency code."),
  menuEnabled: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
