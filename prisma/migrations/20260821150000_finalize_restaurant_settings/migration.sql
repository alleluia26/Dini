-- DropForeignKey
ALTER TABLE "RestaurantSettings" DROP CONSTRAINT "RestaurantSettings_coverAssetId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantSettings" DROP CONSTRAINT "RestaurantSettings_logoAssetId_fkey";

-- AlterTable
ALTER TABLE "RestaurantSettings" DROP COLUMN "coverAssetId",
DROP COLUMN "logoAssetId";
