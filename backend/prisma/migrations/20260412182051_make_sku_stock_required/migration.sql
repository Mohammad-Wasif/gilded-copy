/*
  Warnings:

  - Made the column `sku` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stockQuantity` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stockQuantity` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "stockQuantity" SET NOT NULL,
ALTER COLUMN "stockQuantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "stockQuantity" SET NOT NULL,
ALTER COLUMN "stockQuantity" SET DEFAULT 0;
