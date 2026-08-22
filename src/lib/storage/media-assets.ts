import "server-only";

import { prisma } from "@/lib/db/client";
import { vercelBlobStorage } from "@/lib/storage/vercel-blob";

export async function deleteMediaAssetIfUnused(id: string | null) {
  if (!id) return false;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return false;

  const [categoryImages, menuItemImages] = await Promise.all([
    prisma.category.count({ where: { imageAssetId: id } }),
    prisma.menuItem.count({ where: { imageAssetId: id } }),
  ]);

  if (categoryImages + menuItemImages > 0) {
    return false;
  }

  await vercelBlobStorage.deleteAsset(asset.storageKey);
  await prisma.mediaAsset.delete({ where: { id } });
  return true;
}
