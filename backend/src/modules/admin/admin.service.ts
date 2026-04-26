import { CategoryStatus, OrderStatus, type Prisma } from "@prisma/client";
import { db } from "../../config/db";

// ─── Dashboard Stats ─────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    imageUrl: string | null;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    revenueResult,
    lowStockProducts
  ] = await db.$transaction([
    db.order.count(),
    db.order.count({ where: { status: OrderStatus.PENDING } }),
    db.product.count(),
    db.user.count(),
    db.order.aggregate({
      _sum: { totalAmount: true }
    }),
    db.product.findMany({
      where: { stockQuantity: { lte: 5 } },
      orderBy: { stockQuantity: "asc" },
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true }
        }
      }
    })
  ]);

  return {
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount
      ? parseFloat(revenueResult._sum.totalAmount.toString())
      : 0,
    pendingOrders,
    totalProducts,
    totalCustomers,
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      imageUrl: p.images[0]?.imageUrl ?? null
    }))
  };
}

// ─── Recent Orders ───────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  shippingName: string;
  shippingCity: string;
  shippingState: string;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getRecentOrders(limit: number = 5): Promise<AdminOrder[]> {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      status: true,
      totalAmount: true,
      shippingFee: true,
      shippingName: true,
      shippingCity: true,
      shippingState: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: { items: true }
      }
    }
  });

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: parseFloat(o.totalAmount.toString()),
    shippingFee: parseFloat(o.shippingFee.toString()),
    shippingName: o.shippingName,
    shippingCity: o.shippingCity,
    shippingState: o.shippingState,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    itemCount: o._count.items,
    user: o.user
  }));
}

// ─── All Orders (Paginated) ──────────────────────────────────────────

export interface GetAllOrdersParams {
  page: number;
  limit: number;
  status?: OrderStatus;
}

export async function getAllOrders(params: GetAllOrdersParams) {
  const where: Prisma.OrderWhereInput = {};
  if (params.status) {
    where.status = params.status;
  }

  const [items, total] = await db.$transaction([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        shippingFee: true,
        shippingName: true,
        shippingPhone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingState: true,
        shippingZip: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            priceAtPurchase: true,
            quantity: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    }),
    db.order.count({ where })
  ]);

  return {
    items: items.map((o) => ({
      ...o,
      totalAmount: parseFloat(o.totalAmount.toString()),
      shippingFee: parseFloat(o.shippingFee.toString()),
      itemCount: o._count.items,
      items: o.items.map((item) => ({
        ...item,
        priceAtPurchase: parseFloat(item.priceAtPurchase.toString())
      }))
    })),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit))
    }
  };
}

// ─── Update Order Status ─────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return db.order.update({
    where: { id: orderId },
    data: { status },
    select: {
      id: true,
      status: true,
      updatedAt: true
    }
  });
}

const adminCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  primaryImageUrl: true,
  thumbnailImageUrl: true,
  bannerImageUrl: true,
  status: true,
  sortOrder: true,
  seoTitle: true,
  seoDescription: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      children: true,
      products: true
    }
  }
} satisfies Prisma.CategorySelect;

export interface AdminCategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryImageUrl: string | null;
  thumbnailImageUrl: string | null;
  bannerImageUrl: string | null;
  status: CategoryStatus;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  childCount: number;
  children: AdminCategoryTreeNode[];
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  primaryImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  bannerImageUrl?: string | null;
  status: CategoryStatus;
  sortOrder?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

function createHttpError(message: string, statusCode: number) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildCategoryTree(
  categories: Array<Prisma.CategoryGetPayload<{ select: typeof adminCategorySelect }>>
): AdminCategoryTreeNode[] {
  const nodes = new Map<string, AdminCategoryTreeNode>();

  for (const category of categories) {
    nodes.set(category.id, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      primaryImageUrl: category.primaryImageUrl,
      thumbnailImageUrl: category.thumbnailImageUrl,
      bannerImageUrl: category.bannerImageUrl,
      status: category.status,
      sortOrder: category.sortOrder,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      parentId: category.parentId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category._count.products,
      childCount: category._count.children,
      children: []
    });
  }

  const roots: AdminCategoryTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: AdminCategoryTreeNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}

async function ensureCategoryParentIsValid(categoryId: string, parentId?: string | null) {
  if (!parentId) {
    return;
  }

  if (categoryId === parentId) {
    throw createHttpError("A category cannot be its own parent", 400);
  }

  const categories = await db.category.findMany({
    select: {
      id: true,
      parentId: true
    }
  });

  const parentMap = new Map(categories.map((category) => [category.id, category.parentId]));
  let currentParentId: string | null = parentId;

  while (currentParentId) {
    if (currentParentId === categoryId) {
      throw createHttpError("A category cannot be moved under one of its descendants", 400);
    }
    currentParentId = parentMap.get(currentParentId) ?? null;
  }
}

export async function getAdminCategoryTree() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: adminCategorySelect
  });

  return buildCategoryTree(categories);
}

export async function createCategory(input: AdminCategoryInput) {
  const parentId = input.parentId ?? null;

  if (parentId) {
    const parent = await db.category.findUnique({
      where: { id: parentId },
      select: { id: true }
    });

    if (!parent) {
      throw createHttpError("Parent category not found", 404);
    }
  }

  const maxSortOrder = await db.category.aggregate({
    where: { parentId },
    _max: { sortOrder: true }
  });

  return db.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      parentId,
      description: normalizeOptionalString(input.description),
      primaryImageUrl: normalizeOptionalString(input.primaryImageUrl) ?? normalizeOptionalString(input.thumbnailImageUrl),
      thumbnailImageUrl: normalizeOptionalString(input.thumbnailImageUrl),
      bannerImageUrl: normalizeOptionalString(input.bannerImageUrl),
      status: input.status,
      sortOrder: input.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
      seoTitle: normalizeOptionalString(input.seoTitle),
      seoDescription: normalizeOptionalString(input.seoDescription)
    },
    select: adminCategorySelect
  });
}

export async function updateCategory(categoryId: string, input: AdminCategoryInput) {
  await ensureCategoryParentIsValid(categoryId, input.parentId ?? null);

  if (input.parentId) {
    const parent = await db.category.findUnique({
      where: { id: input.parentId },
      select: { id: true }
    });

    if (!parent) {
      throw createHttpError("Parent category not found", 404);
    }
  }

  return db.category.update({
    where: { id: categoryId },
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      parentId: input.parentId ?? null,
      description: normalizeOptionalString(input.description),
      primaryImageUrl: normalizeOptionalString(input.primaryImageUrl) ?? normalizeOptionalString(input.thumbnailImageUrl),
      thumbnailImageUrl: normalizeOptionalString(input.thumbnailImageUrl),
      bannerImageUrl: normalizeOptionalString(input.bannerImageUrl),
      status: input.status,
      sortOrder: input.sortOrder ?? undefined,
      seoTitle: normalizeOptionalString(input.seoTitle),
      seoDescription: normalizeOptionalString(input.seoDescription)
    },
    select: adminCategorySelect
  });
}

export async function updateCategoryStatus(categoryId: string, status: CategoryStatus) {
  return db.category.update({
    where: { id: categoryId },
    data: { status },
    select: adminCategorySelect
  });
}

export async function reorderCategories(parentId: string | null, orderedIds: string[]) {
  const siblings = await db.category.findMany({
    where: { parentId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true }
  });

  const siblingIds = siblings.map((category) => category.id);
  const requestedIds = [...orderedIds];

  if (
    siblingIds.length !== requestedIds.length ||
    siblingIds.some((id) => !requestedIds.includes(id))
  ) {
    throw createHttpError("Reorder request must include exactly the sibling categories for the chosen parent", 400);
  }

  await db.$transaction(
    requestedIds.map((id, index) =>
      db.category.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  );

  return getAdminCategoryTree();
}

export async function deleteCategory(categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      _count: {
        select: {
          children: true,
          products: true
        }
      }
    }
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  if (category._count.products > 0) {
    throw createHttpError(`This category contains ${category._count.products} products. Move them or archive the category first.`, 400);
  }

  if (category._count.children > 0) {
    throw createHttpError("This category has child categories. Remove or move them before deleting it.", 400);
  }

  await db.category.delete({
    where: { id: categoryId }
  });

  return { id: categoryId };
}

export async function hardDeleteCategory(categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      status: true,
      parentId: true,
      _count: {
        select: {
          children: true,
          products: true
        }
      },
      products: {
        select: {
          id: true,
          name: true,
          status: true
        }
      }
    }
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  // Rule 1: Must NOT be a root category
  if (category.parentId === null) {
    throw createHttpError("Cannot hard-delete a root category. Only subcategories can be permanently removed.", 400);
  }

  // Rule 2: Must NOT be active
  if (category.status === CategoryStatus.ACTIVE) {
    throw createHttpError("Cannot hard-delete an active category. Deactivate or archive it first.", 400);
  }

  // Rule 3: Must NOT have child categories
  if (category._count.children > 0) {
    throw createHttpError("This category has child categories. Remove or move them before deleting.", 400);
  }

  // Rule 4: All associated products must be ARCHIVED
  const nonArchivedProducts = category.products.filter(p => p.status !== "ARCHIVED");
  if (nonArchivedProducts.length > 0) {
    const names = nonArchivedProducts.slice(0, 3).map(p => p.name).join(", ");
    const suffix = nonArchivedProducts.length > 3 ? ` and ${nonArchivedProducts.length - 3} more` : "";
    throw createHttpError(
      `All products must be archived before deleting this category. Non-archived products: ${names}${suffix}`,
      400
    );
  }

  // All checks passed — permanently delete the category
  // First disconnect archived products by setting their categoryId to the parent
  if (category.products.length > 0) {
    await db.product.updateMany({
      where: { categoryId: category.id },
      data: { categoryId: category.parentId! }
    });
  }

  await db.category.delete({
    where: { id: categoryId }
  });

  return { id: categoryId, name: category.name };
}

export async function bulkUpdateCategories(ids: string[], action: "activate" | "deactivate" | "delete") {
  if (ids.length === 0) {
    return { updatedIds: [], errors: [] as string[] };
  }

  if (action === "activate" || action === "deactivate") {
    await db.category.updateMany({
      where: { id: { in: ids } },
      data: {
        status: action === "activate" ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE
      }
    });

    return { updatedIds: ids, errors: [] as string[] };
  }

  const categories = await db.category.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          children: true,
          products: true
        }
      }
    }
  });

  const deletableIds = categories
    .filter((category) => category._count.products === 0 && category._count.children === 0)
    .map((category) => category.id);

  const blocked = categories
    .filter((category) => category._count.products > 0 || category._count.children > 0)
    .map((category) =>
      category._count.products > 0
        ? `${category.name}: contains ${category._count.products} products`
        : `${category.name}: has child categories`
    );

  if (deletableIds.length > 0) {
    await db.category.deleteMany({
      where: { id: { in: deletableIds } }
    });
  }

  return { updatedIds: deletableIds, errors: blocked };
}

// ─── Misc Settings (Shop Applications) ────────────────────────────────

export async function getShopApplications() {
  return db.shopApplication.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
      _count: {
        select: { products: true }
      }
    }
  });
}

export async function createShopApplication(input: { name: string; slug: string; description?: string | null; imageUrl?: string | null; status: CategoryStatus; sortOrder?: number }) {
  return db.shopApplication.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: normalizeOptionalString(input.description),
      imageUrl: normalizeOptionalString(input.imageUrl),
      status: input.status,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

export async function updateShopApplication(id: string, input: { name: string; slug: string; description?: string | null; imageUrl?: string | null; status: CategoryStatus; sortOrder?: number }) {
  return db.shopApplication.update({
    where: { id },
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: normalizeOptionalString(input.description),
      imageUrl: normalizeOptionalString(input.imageUrl),
      status: input.status,
      sortOrder: input.sortOrder ?? 0
    }
  });
}

export async function deleteShopApplication(id: string) {
  await db.shopApplication.delete({ where: { id } });
  return { id };
}

export async function getShopApplicationProducts(applicationId: string) {
  const app = await db.shopApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      name: true,
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          status: true,
          basePrice: true,
          stockQuantity: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true }
          }
        },
        orderBy: { name: "asc" }
      }
    }
  });
  return app;
}

export async function updateShopApplicationProducts(applicationId: string, productIds: string[]) {
  return db.shopApplication.update({
    where: { id: applicationId },
    data: {
      products: {
        set: productIds.map(id => ({ id }))
      }
    },
    select: {
      id: true,
      name: true,
      _count: { select: { products: true } }
    }
  });
}

export async function searchProductsForApplication(search: string) {
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } }
      ]
    },
    take: 20,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      status: true,
      basePrice: true,
      stockQuantity: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { imageUrl: true }
      }
    }
  });
}
