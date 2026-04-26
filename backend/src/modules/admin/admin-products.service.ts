import { OrderStatus, ProductStatus, ProductVariantStatus, Prisma } from "@prisma/client";
import { db } from "../../config/db";

// ─── Types ───────────────────────────────────────────────────────────

export interface AdminProductListParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "newest" | "oldest" | "recently_updated";
}

export interface AdminProductInput {
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice?: number | null;
  discountPrice?: number | null;
  purchasePrice?: number | null;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  tags?: string[];
  supplier?: string | null;
  categoryId: string;
  applicationIds?: string[];
  images?: Array<{
    imageUrl: string;
    altText?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  variants?: Array<{
    id?: string;
    title: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    finish?: string | null;
    imageUrl?: string | null;
    status?: ProductVariantStatus;
    priceOverride?: number | null;
    stockQuantity?: number;
    sortOrder?: number;
  }>;
}

export interface AdminProductLogEntry {
  id: string;
  action: string;
  details: string | null;
  adminId: string | null;
  adminName: string | null;
  createdAt: Date;
}

export interface AdminProductImportPayload {
  name: string;
  sku: string;
  categoryName: string;
  subCategoryName?: string | null;
  basePrice: number;
  stockQuantity: number;
  description?: string | null;
  status?: ProductStatus;
  supplier?: string | null;
  tags?: string[];
}

// ─── Helper ──────────────────────────────────────────────────────────

function createHttpError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function writeLog(
  productId: string,
  action: string,
  details: object | null,
  adminId?: string | null,
  adminName?: string | null
) {
  await db.productLog.create({
    data: {
      productId,
      action,
      details: details ? JSON.stringify(details) : null,
      adminId: adminId ?? null,
      adminName: adminName ?? null,
    },
  });
}

const adminProductSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  status: true,
  basePrice: true,
  compareAtPrice: true,
  discountPrice: true,
  purchasePrice: true,
  sku: true,
  stockQuantity: true,
  lowStockThreshold: true,
  isFeatured: true,
  sortOrder: true,
  tags: true,
  supplier: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  applications: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      status: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    }
  },
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    select: {
      id: true,
      imageUrl: true,
      altText: true,
      isPrimary: true,
      sortOrder: true,
    },
  },
  variants: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      title: true,
      sku: true,
      size: true,
      color: true,
      material: true,
      finish: true,
      imageUrl: true,
      status: true,
      priceOverride: true,
      stockQuantity: true,
      sortOrder: true,
    },
  },
  _count: {
    select: {
      variants: true,
      orderItems: true,
    },
  },
} satisfies Prisma.ProductSelect;

// ─── Product Dashboard Stats ──────────────────────────────────────────

export async function getProductDashboardStats() {
  const [
    totalProducts,
    outOfStockCount,
    recentlyAddedCount,
    inventoryValueResult,
    allProducts,
  ] = await db.$transaction([
    db.product.count(),
    db.product.count({ where: { stockQuantity: 0 } }),
    db.product.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.product.aggregate({ _sum: { basePrice: true } }),
    db.product.findMany({
      select: { stockQuantity: true, lowStockThreshold: true, basePrice: true },
    }),
  ]);

  const lowStockCount = allProducts.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
  ).length;

  const totalInventoryValue = allProducts.reduce(
    (sum, p) =>
      sum + parseFloat(p.basePrice.toString()) * p.stockQuantity,
    0
  );

  return {
    totalProducts,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    lowStockCount,
    outOfStockCount,
    recentlyAddedCount,
  };
}

// ─── List Products (Admin) ────────────────────────────────────────────

export async function listAdminProducts(params: AdminProductListParams) {
  const where: Prisma.ProductWhereInput = {};

  // Search
  if (params.search) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
      { supplier: { contains: q, mode: "insensitive" } },
    ];
  }

  // Category
  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  // Status
  if (params.status) {
    where.status = params.status;
  }

  // Stock status
  if (params.stockStatus === "out_of_stock") {
    where.stockQuantity = 0;
  } else if (params.stockStatus === "in_stock") {
    where.stockQuantity = { gt: 0 };
  }
  // low_stock is post-filter after fetch

  // Supplier
  if (params.supplier) {
    where.supplier = { contains: params.supplier, mode: "insensitive" };
  }

  // Price range
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.basePrice = {};
    if (params.minPrice !== undefined) where.basePrice.gte = params.minPrice;
    if (params.maxPrice !== undefined) where.basePrice.lte = params.maxPrice;
  }

  // Sort
  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ updatedAt: "desc" }];
  switch (params.sort) {
    case "name_asc": orderBy = [{ name: "asc" }]; break;
    case "name_desc": orderBy = [{ name: "desc" }]; break;
    case "price_asc": orderBy = [{ basePrice: "asc" }]; break;
    case "price_desc": orderBy = [{ basePrice: "desc" }]; break;
    case "stock_asc": orderBy = [{ stockQuantity: "asc" }]; break;
    case "stock_desc": orderBy = [{ stockQuantity: "desc" }]; break;
    case "newest": orderBy = [{ createdAt: "desc" }]; break;
    case "oldest": orderBy = [{ createdAt: "asc" }]; break;
    case "recently_updated": orderBy = [{ updatedAt: "desc" }]; break;
  }

  const [items, total] = await db.$transaction([
    db.product.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: adminProductSelect,
    }),
    db.product.count({ where }),
  ]);

  let finalItems = items;

  // Post-filter for low_stock (needs per-product threshold comparison)
  if (params.stockStatus === "low_stock") {
    finalItems = items.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    );
  }

  // Build reserved stock map: sum quantities for PENDING/PROCESSING orders
  const productIds = finalItems.map((p) => p.id);
  const reservedAgg = await db.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { in: productIds },
      order: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
      },
    },
    _sum: { quantity: true },
  });
  const reservedMap = new Map<string, number>(
    reservedAgg.map((r) => [r.productId!, r._sum.quantity ?? 0])
  );

  return {
    items: finalItems.map((p) => serializeProduct(p, reservedMap.get(p.id) ?? 0)),
    pagination: {
      page: params.page,
      limit: params.limit,
      total: params.stockStatus === "low_stock" ? finalItems.length : total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}

// ─── Get Single Product ───────────────────────────────────────────────

export async function getAdminProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    select: adminProductSelect,
  });

  if (!product) throw createHttpError("Product not found", 404);

  // Calculate reserved stock for this product
  const reservedAgg = await db.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: id,
      order: { status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] } },
    },
    _sum: { quantity: true },
  });
  const reserved = reservedAgg[0]?._sum.quantity ?? 0;

  return serializeProduct(product, reserved);
}

// ─── Stock Overview ───────────────────────────────────────────────────

export async function getStockOverview() {
  // Fetch ALL products (no pagination) for stock management view
  const allProducts = await db.product.findMany({
    orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
    select: adminProductSelect,
  });

  // Build reserved map for all products
  const reservedAgg = await db.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { in: allProducts.map((p) => p.id) },
      order: { status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] } },
    },
    _sum: { quantity: true },
  });
  const reservedMap = new Map<string, number>(
    reservedAgg.map((r) => [r.productId!, r._sum.quantity ?? 0])
  );

  const serialized = allProducts.map((p) => serializeProduct(p, reservedMap.get(p.id) ?? 0));

  return {
    products: serialized,
    outOfStock: serialized.filter((p) => p.stockQuantity === 0),
    lowStock: serialized.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold),
    healthy: serialized.filter((p) => p.stockQuantity > p.lowStockThreshold),
  };
}

// ─── Create Product ───────────────────────────────────────────────────

export async function createAdminProduct(
  input: AdminProductInput,
  adminId?: string | null,
  adminName?: string | null
) {
  const existing = await db.product.findUnique({ where: { slug: input.slug } });
  if (existing) throw createHttpError("A product with this slug already exists", 409);

  const existingSku = await db.product.findUnique({ where: { sku: input.sku } });
  if (existingSku) throw createHttpError("A product with this SKU already exists", 409);

  const product = await db.product.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      shortDescription: normalizeOptional(input.shortDescription),
      description: normalizeOptional(input.description),
      status: input.status,
      basePrice: input.basePrice,
      compareAtPrice: input.compareAtPrice ?? null,
      discountPrice: input.discountPrice ?? null,
      purchasePrice: input.purchasePrice ?? null,
      sku: input.sku.trim(),
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      tags: input.tags ?? [],
      supplier: normalizeOptional(input.supplier),
      categoryId: input.categoryId,
      applications: input.applicationIds?.length
        ? { connect: input.applicationIds.map((id) => ({ id })) }
        : undefined,
      images: input.images?.length
        ? {
            create: input.images.map((img, idx) => ({
              imageUrl: img.imageUrl,
              altText: normalizeOptional(img.altText),
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx,
            })),
          }
        : undefined,
      variants: input.variants?.length
        ? {
            create: input.variants.map((v, idx) => ({
              title: v.title.trim(),
              sku: v.sku.trim(),
              size: normalizeOptional(v.size),
              color: normalizeOptional(v.color),
              material: normalizeOptional(v.material),
              finish: normalizeOptional(v.finish),
              imageUrl: normalizeOptional(v.imageUrl),
              status: v.status ?? ProductVariantStatus.ACTIVE,
              priceOverride: v.priceOverride ?? null,
              stockQuantity: v.stockQuantity ?? 0,
              sortOrder: v.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    select: adminProductSelect,
  });

  await writeLog(product.id, "created", { name: product.name, sku: product.sku }, adminId, adminName);

  return serializeProduct(product);
}

// ─── Update Product ───────────────────────────────────────────────────

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput,
  adminId?: string | null,
  adminName?: string | null
) {
  const existing = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      basePrice: true,
      categoryId: true,
      stockQuantity: true,
      images: { select: { id: true } },
      variants: { select: { id: true } },
    },
  });

  if (!existing) throw createHttpError("Product not found", 404);

  // Track changes for log
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (parseFloat(existing.basePrice.toString()) !== input.basePrice)
    changes.basePrice = { from: existing.basePrice, to: input.basePrice };
  if (existing.categoryId !== input.categoryId)
    changes.categoryId = { from: existing.categoryId, to: input.categoryId };
  if (existing.stockQuantity !== input.stockQuantity)
    changes.stockQuantity = { from: existing.stockQuantity, to: input.stockQuantity };

  // Delete existing images & variants and recreate (simple replace strategy)
  await db.$transaction([
    db.productImage.deleteMany({ where: { productId: id } }),
    db.productVariant.deleteMany({ where: { productId: id } }),
  ]);

  const updated = await db.product.update({
    where: { id },
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      shortDescription: normalizeOptional(input.shortDescription),
      description: normalizeOptional(input.description),
      status: input.status,
      basePrice: input.basePrice,
      compareAtPrice: input.compareAtPrice ?? null,
      discountPrice: input.discountPrice ?? null,
      purchasePrice: input.purchasePrice ?? null,
      sku: input.sku.trim(),
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      tags: input.tags ?? [],
      supplier: normalizeOptional(input.supplier),
      categoryId: input.categoryId,
      applications: { set: input.applicationIds?.map((id) => ({ id })) ?? [] },
      images: input.images?.length
        ? {
            create: input.images.map((img, idx) => ({
              imageUrl: img.imageUrl,
              altText: normalizeOptional(img.altText),
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx,
            })),
          }
        : undefined,
      variants: input.variants?.length
        ? {
            create: input.variants.map((v, idx) => ({
              title: v.title.trim(),
              sku: v.sku.trim(),
              size: normalizeOptional(v.size),
              color: normalizeOptional(v.color),
              material: normalizeOptional(v.material),
              finish: normalizeOptional(v.finish),
              imageUrl: normalizeOptional(v.imageUrl),
              status: v.status ?? ProductVariantStatus.ACTIVE,
              priceOverride: v.priceOverride ?? null,
              stockQuantity: v.stockQuantity ?? 0,
              sortOrder: v.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    select: adminProductSelect,
  });

  if (Object.keys(changes).length > 0) {
    await writeLog(id, "edited", changes, adminId, adminName);
  } else {
    await writeLog(id, "edited", { name: input.name }, adminId, adminName);
  }

  return serializeProduct(updated);
}

// ─── Quick Stock Adjust ───────────────────────────────────────────────

export async function quickStockAdjust(
  id: string,
  delta: number,
  adminId?: string | null,
  adminName?: string | null
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, stockQuantity: true },
  });
  if (!product) throw createHttpError("Product not found", 404);

  const newQty = Math.max(0, product.stockQuantity + delta);

  const updated = await db.product.update({
    where: { id },
    data: { stockQuantity: newQty },
    select: adminProductSelect,
  });

  await writeLog(
    id,
    "stock_changed",
    { from: product.stockQuantity, to: newQty, delta },
    adminId,
    adminName
  );

  return serializeProduct(updated);
}

// ─── Delete Product ───────────────────────────────────────────────────

export async function deleteAdminProduct(
  id: string,
  adminId?: string | null,
  adminName?: string | null
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { orderItems: true } } },
  });
  if (!product) throw createHttpError("Product not found", 404);

  if (product._count.orderItems > 0) {
    // Soft delete — archive instead of hard delete
    await db.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
    await writeLog(id, "archived", { reason: "has_orders" }, adminId, adminName);
    return { id, archived: true };
  }

  await writeLog(id, "deleted", { name: product.name }, adminId, adminName);
  await db.product.delete({ where: { id } });
  return { id, archived: false };
}

// ─── Duplicate Product ────────────────────────────────────────────────

export async function duplicateAdminProduct(
  id: string,
  adminId?: string | null,
  adminName?: string | null
) {
  const source = await db.product.findUnique({
    where: { id },
    select: adminProductSelect,
  });
  if (!source) throw createHttpError("Product not found", 404);

  const baseName = source.name;
  const baseSlug = source.slug;
  const baseSku = source.sku;

  // Find a unique slug/sku
  let suffix = 1;
  let newSlug = `${baseSlug}-copy`;
  let newSku = `${baseSku}-CPY`;
  while (await db.product.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${baseSlug}-copy-${++suffix}`;
  }
  while (await db.product.findUnique({ where: { sku: newSku } })) {
    newSku = `${baseSku}-CPY${++suffix}`;
  }

  const newProduct = await db.product.create({
    data: {
      name: `${baseName} (Copy)`,
      slug: newSlug,
      shortDescription: source.shortDescription,
      description: source.description,
      status: ProductStatus.DRAFT,
      basePrice: source.basePrice,
      compareAtPrice: source.compareAtPrice,
      discountPrice: source.discountPrice,
      purchasePrice: source.purchasePrice,
      sku: newSku,
      stockQuantity: source.stockQuantity,
      lowStockThreshold: source.lowStockThreshold,
      isFeatured: false,
      sortOrder: source.sortOrder,
      tags: source.tags,
      supplier: source.supplier,
      categoryId: source.categoryId,
      images: {
        create: source.images.map((img) => ({
          imageUrl: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      },
      variants: {
        create: source.variants.map((v) => ({
          title: v.title,
          sku: `${v.sku}-CPY`,
          size: v.size,
          color: v.color,
          material: v.material,
          finish: v.finish,
          imageUrl: v.imageUrl,
          status: ProductVariantStatus.ACTIVE,
          priceOverride: v.priceOverride,
          stockQuantity: v.stockQuantity,
          sortOrder: v.sortOrder,
        })),
      },
    },
    select: adminProductSelect,
  });

  await writeLog(newProduct.id, "created", { duplicatedFrom: id }, adminId, adminName);
  return serializeProduct(newProduct);
}

// ─── Bulk Action ──────────────────────────────────────────────────────

export async function bulkProductAction(
  ids: string[],
  action: "delete" | "archive" | "activate" | "draft" | "hidden" | "duplicate",
  adminId?: string | null,
  adminName?: string | null
) {
  const results: string[] = [];
  const errors: string[] = [];

  for (const id of ids) {
    try {
      if (action === "delete") {
        await deleteAdminProduct(id, adminId, adminName);
      } else if (action === "duplicate") {
        await duplicateAdminProduct(id, adminId, adminName);
      } else {
        const statusMap: Record<string, ProductStatus> = {
          archive: ProductStatus.ARCHIVED,
          activate: ProductStatus.ACTIVE,
          draft: ProductStatus.DRAFT,
          hidden: ProductStatus.HIDDEN,
        };
        await db.product.update({ where: { id }, data: { status: statusMap[action] } });
        await writeLog(id, "status_changed", { to: action }, adminId, adminName);
      }
      results.push(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${id}: ${message}`);
    }
  }

  return { updatedIds: results, errors };
}

// ─── Bulk Upsert (Import) ─────────────────────────────────────────────

export async function bulkUpsertProducts(
  rows: AdminProductImportPayload[],
  adminId?: string | null,
  adminName?: string | null
) {
  const results = { created: 0, updated: 0, errors: [] as string[] };

  // Cache for categories to avoid redundant queries
  const categoryCache = new Map<string, string>();

  for (const row of rows) {
    try {
      // 1. Resolve Category
      const fullCatName = `${row.categoryName}${row.subCategoryName ? ` > ${row.subCategoryName}` : ""}`;
      let categoryId = categoryCache.get(fullCatName);

      if (!categoryId) {
        // Find or create parent
        let parent = await db.category.findFirst({
          where: { name: { equals: row.categoryName, mode: "insensitive" }, parentId: null },
        });

        if (!parent) {
          const slug = row.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          parent = await db.category.create({ data: { name: row.categoryName, slug } });
        }

        let targetId = parent.id;

        // Find or create subcategory if needed
        if (row.subCategoryName) {
          let sub = await db.category.findFirst({
            where: {
              name: { equals: row.subCategoryName, mode: "insensitive" },
              parentId: parent.id,
            },
          });
          if (!sub) {
            const subSlug = `${parent.slug}-${row.subCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            sub = await db.category.create({
              data: { name: row.subCategoryName, slug: subSlug, parentId: parent.id },
            });
          }
          targetId = sub.id;
        }

        categoryId = targetId;
        categoryCache.set(fullCatName, categoryId);
      }

      // 2. Prepare Data
      const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const productData = {
        name: row.name,
        slug,
        basePrice: new Prisma.Decimal(row.basePrice),
        stockQuantity: row.stockQuantity,
        description: row.description || null,
        status: row.status || ProductStatus.ACTIVE,
        supplier: row.supplier || null,
        tags: row.tags || [],
        categoryId,
      };

      // 3. Upsert
      const existing = await db.product.findUnique({ where: { sku: row.sku } });

      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: productData,
        });
        await writeLog(existing.id, "imported_update", { sku: row.sku }, adminId, adminName);
        results.updated++;
      } else {
        const created = await db.product.create({
          data: { ...productData, sku: row.sku },
        });
        await writeLog(created.id, "imported_create", { sku: row.sku }, adminId, adminName);
        results.created++;
      }
    } catch (err: any) {
      results.errors.push(`${row.sku || "unknown"}: ${err.message}`);
    }
  }

  return results;
}

// ─── Product Logs ─────────────────────────────────────────────────────

export async function getProductLogs(productId: string) {
  const logs = await db.productLog.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return logs;
}

// ─── Serializer ───────────────────────────────────────────────────────

function serializeProduct(
  p: Prisma.ProductGetPayload<{ select: typeof adminProductSelect }>,
  reservedStock = 0
) {
  const total = p.stockQuantity;
  const available = Math.max(0, total - reservedStock);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    status: p.status,
    basePrice: parseFloat(p.basePrice.toString()),
    compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice.toString()) : null,
    discountPrice: p.discountPrice ? parseFloat(p.discountPrice.toString()) : null,
    purchasePrice: p.purchasePrice ? parseFloat(p.purchasePrice.toString()) : null,
    sku: p.sku,
    stockQuantity: total,
    reservedStock,
    availableStock: available,
    lowStockThreshold: p.lowStockThreshold,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    tags: p.tags,
    supplier: p.supplier,
    categoryId: p.categoryId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    category: p.category,
    applications: p.applications,
    images: p.images,
    variants: p.variants.map((v) => ({
      ...v,
      priceOverride: v.priceOverride ? parseFloat(v.priceOverride.toString()) : null,
    })),
    variantCount: p._count.variants,
    orderCount: p._count.orderItems,
  };
}
