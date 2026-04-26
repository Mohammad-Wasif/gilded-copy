import { Request, Response } from "express";
import { CategoryStatus, OrderStatus } from "@prisma/client";
import { z } from "zod";
import {
  bulkUpdateCategories,
  createCategory,
  getDashboardStats,
  getAdminCategoryTree,
  getRecentOrders,
  getAllOrders,
  reorderCategories,
  updateCategory,
  updateCategoryStatus,
  updateOrderStatus,
  deleteCategory,
  hardDeleteCategory,
  getShopApplications,
  createShopApplication,
  updateShopApplication,
  deleteShopApplication,
  getShopApplicationProducts,
  updateShopApplicationProducts,
  searchProductsForApplication
} from "./admin.service";

export async function handleDashboardStats(_req: Request, res: Response) {
  const stats = await getDashboardStats();
  res.status(200).json({ success: true, data: stats });
}

export async function handleRecentOrders(req: Request, res: Response) {
  const { limit } = z
    .object({ limit: z.coerce.number().int().min(1).max(20).default(5) })
    .parse(req.query);

  const orders = await getRecentOrders(limit);
  res.status(200).json({ success: true, data: orders });
}

export async function handleAllOrders(req: Request, res: Response) {
  const query = z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
      status: z.nativeEnum(OrderStatus).optional()
    })
    .parse(req.query);

  const result = await getAllOrders(query);
  res.status(200).json({
    success: true,
    data: result.items,
    meta: { pagination: result.pagination }
  });
}

export async function handleUpdateOrderStatus(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { status } = z
    .object({ status: z.nativeEnum(OrderStatus) })
    .parse(req.body);

  const updated = await updateOrderStatus(id, status);
  res.status(200).json({ success: true, data: updated });
}

const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140),
  parentId: z.string().trim().min(1).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  primaryImageUrl: z.string().trim().url().nullable().optional(),
  thumbnailImageUrl: z.string().trim().url().nullable().optional(),
  bannerImageUrl: z.string().trim().url().nullable().optional(),
  status: z.nativeEnum(CategoryStatus),
  sortOrder: z.coerce.number().int().min(0).nullable().optional(),
  seoTitle: z.string().trim().max(180).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional()
});

export async function handleAdminCategoryTree(_req: Request, res: Response) {
  const tree = await getAdminCategoryTree();
  res.status(200).json({ success: true, data: tree });
}

export async function handleCreateCategory(req: Request, res: Response) {
  const input = categoryInputSchema.parse(req.body);
  const created = await createCategory(input);
  res.status(201).json({ success: true, data: created });
}

export async function handleUpdateCategory(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const input = categoryInputSchema.parse(req.body);
  const updated = await updateCategory(id, input);
  res.status(200).json({ success: true, data: updated });
}

export async function handleUpdateCategoryStatus(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { status } = z
    .object({
      status: z.enum([CategoryStatus.ACTIVE, CategoryStatus.INACTIVE])
    })
    .parse(req.body);

  const updated = await updateCategoryStatus(id, status);
  res.status(200).json({ success: true, data: updated });
}

export async function handleDeleteCategory(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const deleted = await deleteCategory(id);
  res.status(200).json({ success: true, data: deleted });
}

export async function handleHardDeleteCategory(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const deleted = await hardDeleteCategory(id);
  res.status(200).json({ success: true, data: deleted });
}

export async function handleReorderCategories(req: Request, res: Response) {
  const { parentId, orderedIds } = z
    .object({
      parentId: z.string().trim().min(1).nullable(),
      orderedIds: z.array(z.string().trim().min(1)).min(1)
    })
    .parse(req.body);

  const tree = await reorderCategories(parentId, orderedIds);
  res.status(200).json({ success: true, data: tree });
}

export async function handleBulkUpdateCategories(req: Request, res: Response) {
  const { ids, action } = z
    .object({
      ids: z.array(z.string().trim().min(1)).min(1),
      action: z.enum(["activate", "deactivate", "delete"])
    })
    .parse(req.body);

  const result = await bulkUpdateCategories(ids, action);
  res.status(200).json({ success: true, data: result });
}

export async function handleGetShopApplications(req: Request, res: Response) {
  const data = await getShopApplications();
  res.status(200).json({ success: true, data });
}

export async function handleCreateShopApplication(req: Request, res: Response) {
  const input = z.object({
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    description: z.string().trim().optional().transform(v => v || null),
    imageUrl: z.string().trim().optional().transform(v => (v && v.startsWith('http') ? v : null)),
    status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
    sortOrder: z.coerce.number().int().default(0)
  }).parse(req.body);

  const created = await createShopApplication(input);
  res.status(201).json({ success: true, data: created });
}

export async function handleUpdateShopApplication(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const input = z.object({
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    description: z.string().trim().optional().transform(v => v || null),
    imageUrl: z.string().trim().optional().transform(v => (v && v.startsWith('http') ? v : null)),
    status: z.nativeEnum(CategoryStatus).default(CategoryStatus.ACTIVE),
    sortOrder: z.coerce.number().int().default(0)
  }).parse(req.body);

  const updated = await updateShopApplication(id, input);
  res.status(200).json({ success: true, data: updated });
}

export async function handleDeleteShopApplication(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const deleted = await deleteShopApplication(id);
  res.status(200).json({ success: true, data: deleted });
}

export async function handleGetShopApplicationProducts(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const data = await getShopApplicationProducts(id);
  res.status(200).json({ success: true, data });
}

export async function handleUpdateShopApplicationProducts(req: Request, res: Response) {
  const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
  const { productIds } = z.object({
    productIds: z.array(z.string().min(1))
  }).parse(req.body);
  const updated = await updateShopApplicationProducts(id, productIds);
  res.status(200).json({ success: true, data: updated });
}

export async function handleSearchProductsForApplication(req: Request, res: Response) {
  const { q } = z.object({ q: z.string().trim().min(1) }).parse(req.query);
  const products = await searchProductsForApplication(q);
  res.status(200).json({ success: true, data: products });
}
