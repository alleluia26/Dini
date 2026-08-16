import "server-only";

import { prisma } from "@/lib/db/client";
import { vercelBlobStorage } from "@/lib/storage/vercel-blob";

export async function deleteMediaAssetIfUnused(id: string | null) {
  if (!id) return false;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return false;

  const [categoryImages, menuItemImages, settingsLogoUsage, settingsCoverUsage] =
    await Promise.all([
      prisma.category.count({ where: { imageAssetId: id } }),
      prisma.menuItem.count({ where: { imageAssetId: id } }),
      prisma.restaurantSettings.count({ where: { logoAssetId: id } }),
      prisma.restaurantSettings.count({ where: { coverAssetId: id } }),
    ]);

  if (categoryImages + menuItemImages + settingsLogoUsage + settingsCoverUsage > 0) {
    return false;
  }

  await vercelBlobStorage.deleteAsset(asset.storageKey);
  await prisma.mediaAsset.delete({ where: { id } });
  return true;
}
