import { Request, Response } from "express";
import { ProductStatus, ProductVariantStatus } from "@prisma/client";
import { z } from "zod";
import {
  listAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  duplicateAdminProduct,
  quickStockAdjust,
  bulkProductAction,
  getProductLogs,
  getProductDashboardStats,
  getStockOverview,
  bulkUpsertProducts,
} from "./admin-products.service";

// ─── Zod Schemas ──────────────────────────────────────────────────────

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  sku: z.string().trim().min(1).max(64),
  size: z.string().trim().max(64).nullable().optional(),
  color: z.string().trim().max(64).nullable().optional(),
  material: z.string().trim().max(64).nullable().optional(),
  finish: z.string().trim().max(64).nullable().optional(),
  imageUrl: z.string().trim().url().or(z.literal("")).nullable().optional(),
  status: z.nativeEnum(ProductVariantStatus).optional(),
  priceOverride: z.number().min(0).nullable().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const imageSchema = z.object({
  imageUrl: z.string().url().or(z.literal("")),
  altText: z.string().max(180).nullable().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const productInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180),
  shortDescription: z.string().trim().max(280).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  status: z.nativeEnum(ProductStatus),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().min(0).nullable().optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  purchasePrice: z.number().min(0).nullable().optional(),
  sku: z.string().trim().min(1).max(64),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  tags: z.array(z.string().trim().min(1).max(64)).optional(),
  supplier: z.string().trim().max(160).nullable().optional(),
  categoryId: z.string().trim().min(1),
  applicationIds: z.array(z.string().trim().min(1)).optional(),
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  supplier: z.string().max(160).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z
    .enum([
      "name_asc",
      "name_desc",
      "price_asc",
      "price_desc",
      "stock_asc",
      "stock_desc",
      "newest",
      "oldest",
      "recently_updated",
    ])
    .optional(),
});

// ─── Handlers ─────────────────────────────────────────────────────────

function getAdminContext(req: Request) {
  const admin = (req as any).admin as { id?: string; name?: string } | undefined;
  return { adminId: admin?.id ?? null, adminName: admin?.name ?? null };
}

export async function handleListAdminProducts(req: Request, res: Response) {
  const params = listQuerySchema.parse(req.query);
  const result = await listAdminProducts(params);
  res.status(200).json({ success: true, data: result.items, meta: { pagination: result.pagination } });
}

export async function handleGetProductStats(req: Request, res: Response) {
  const stats = await getProductDashboardStats();
  res.status(200).json({ success: true, data: stats });
}

export async function handleGetAdminProduct(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const product = await getAdminProductById(id);
  res.status(200).json({ success: true, data: product });
}

export async function handleCreateAdminProduct(req: Request, res: Response) {
  const input = productInputSchema.parse(req.body);
  const { adminId, adminName } = getAdminContext(req);
  const product = await createAdminProduct(input, adminId, adminName);
  res.status(201).json({ success: true, data: product });
}

export async function handleUpdateAdminProduct(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const input = productInputSchema.parse(req.body);
  const { adminId, adminName } = getAdminContext(req);
  const product = await updateAdminProduct(id, input, adminId, adminName);
  res.status(200).json({ success: true, data: product });
}

export async function handleDeleteAdminProduct(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { adminId, adminName } = getAdminContext(req);
  const result = await deleteAdminProduct(id, adminId, adminName);
  res.status(200).json({ success: true, data: result });
}

export async function handleDuplicateAdminProduct(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { adminId, adminName } = getAdminContext(req);
  const product = await duplicateAdminProduct(id, adminId, adminName);
  res.status(201).json({ success: true, data: product });
}

export async function handleQuickStockAdjust(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { delta } = z.object({ delta: z.number().int() }).parse(req.body);
  const { adminId, adminName } = getAdminContext(req);
  const product = await quickStockAdjust(id, delta, adminId, adminName);
  res.status(200).json({ success: true, data: product });
}

export async function handleBulkProductAction(req: Request, res: Response) {
  const { ids, action } = z
    .object({
      ids: z.array(z.string().trim().min(1)).min(1),
      action: z.enum(["delete", "archive", "activate", "draft", "hidden", "duplicate"]),
    })
    .parse(req.body);
  const { adminId, adminName } = getAdminContext(req);
  const result = await bulkProductAction(ids, action, adminId, adminName);
  res.status(200).json({ success: true, data: result });
}

export async function handleGetProductLogs(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const logs = await getProductLogs(id);
  res.status(200).json({ success: true, data: logs });
}

export async function handleGetStockOverview(_req: Request, res: Response) {
  const overview = await getStockOverview();
  res.status(200).json({ success: true, data: overview });
}

export async function handleBulkUpsertProducts(req: Request, res: Response) {
  const schema = z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      categoryName: z.string().min(1),
      subCategoryName: z.string().optional().nullable(),
      basePrice: z.number().min(0),
      stockQuantity: z.number().int().min(0),
      description: z.string().optional().nullable(),
      status: z.enum(["ACTIVE", "DRAFT", "HIDDEN", "ARCHIVED"]).optional(),
      supplier: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
    })
  );

  const rows = schema.parse(req.body);
  const result = await bulkUpsertProducts(
    rows,
    (req as any).user?.id,
    (req as any).user?.name
  );

  res.status(200).json({ success: true, data: result });
}
