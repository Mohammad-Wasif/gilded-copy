import { CategoryStatus, ProductStatus, ProductVariantStatus, type Prisma } from "@prisma/client";
import { db } from "../../config/db";

export interface ListCategoriesParams {
  parentSlug?: string;
}

export interface GetProductsParams {
  page: number;
  limit: number;
  category?: string;
  featured?: boolean;
  status?: ProductStatus;
  maxPrice?: number;
  application?: string;
  sort: "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
}

export interface SearchProductsParams {
  query: string;
  page: number;
  limit: number;
}

const categoryBaseSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  primaryImageUrl: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.CategorySelect;

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  status: true,
  basePrice: true,
  compareAtPrice: true,
  sku: true,
  stockQuantity: true,
  isFeatured: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    take: 1,
    select: {
      imageUrl: true,
      altText: true,
      isPrimary: true
    }
  },
  variants: {
    where: {
      status: ProductVariantStatus.ACTIVE
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      size: true,
      color: true,
      material: true,
      priceOverride: true,
      stockQuantity: true,
      sku: true
    }
  }
} satisfies Prisma.ProductSelect;

function getProductOrderBy(sort: GetProductsParams["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ basePrice: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ basePrice: "desc" }, { createdAt: "desc" }];
    case "name_asc":
      return [{ name: "asc" }];
    case "name_desc":
      return [{ name: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

function buildProductListWhere(params: Pick<GetProductsParams, "category" | "featured" | "status" | "maxPrice" | "application">): Prisma.ProductWhereInput {
  const categories = params.category ? params.category.split(',').map(c => c.trim()).filter(Boolean) : [];
  
  let categoryCondition: Prisma.CategoryWhereInput | undefined = undefined;
  if (categories.length > 0) {
    categoryCondition = {
      OR: [
        { slug: { in: categories } },
        { parent: { slug: { in: categories } } }
      ]
    };
  }

  return {
    status: params.status ?? ProductStatus.ACTIVE,
    isFeatured: params.featured,
    category: categoryCondition,
    applications: params.application ? {
      some: {
        slug: params.application
      }
    } : undefined,
    basePrice: params.maxPrice
      ? {
          lte: params.maxPrice
        }
      : undefined
  };
}

export async function listCategories(params: ListCategoriesParams) {
  const where: Prisma.CategoryWhereInput = {
    status: CategoryStatus.ACTIVE,
    parent: params.parentSlug
      ? {
          slug: params.parentSlug
        }
      : undefined
  };

  const categories = await db.category.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      ...categoryBaseSelect,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          children: true,
          products: true
        }
      }
    }
  });

  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: {
      slug,
      status: CategoryStatus.ACTIVE
    },
    select: {
      ...categoryBaseSelect,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        where: {
          status: CategoryStatus.ACTIVE
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          ...categoryBaseSelect,
          _count: {
            select: {
              products: true
            }
          }
        }
      },
      products: {
        where: {
          status: ProductStatus.ACTIVE
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: productCardSelect,
        take: 12
      },
      _count: {
        select: {
          children: true,
          products: true
        }
      }
    }
  });
}

export async function listProducts(params: GetProductsParams) {
  const where = buildProductListWhere(params);

  const [items, total] = await db.$transaction([
    db.product.findMany({
      where,
      orderBy: getProductOrderBy(params.sort),
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: productCardSelect
    }),
    db.product.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit))
    }
  };
}

export async function getCategoryTree() {
  return db.category.findMany({
    where: {
      status: CategoryStatus.ACTIVE,
      parentId: null
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      ...categoryBaseSelect,
      _count: {
        select: {
          children: true,
          products: true
        }
      },
      children: {
        where: {
          status: CategoryStatus.ACTIVE
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          ...categoryBaseSelect,
          _count: {
            select: {
              children: true,
              products: true
            }
          }
        }
      }
    }
  });
}

export async function getFeaturedProducts(limit: number) {
  return db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      isFeatured: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: productCardSelect
  });
}

/**
 * Returns "best seller" products using a merchandising proxy.
 *
 * This does NOT use actual sales/order data. Instead, it ranks by:
 *   1. `isFeatured` (featured items first)
 *   2. `sortOrder`  (manual merchandising weight)
 *   3. `createdAt`  (newest as tiebreaker)
 *
 * The response includes `rankingSource: "merchandising_proxy"` so the
 * frontend can display an appropriate label (e.g. "Staff Picks" vs
 * "Best Sellers") depending on the source.
 *
 * @todo Replace with real order-based ranking once the Orders table
 *       is implemented. Suggested approach:
 *       - Aggregate `OrderItem.quantity` per product over rolling 30 days
 *       - Join to Product and sort by total units sold DESC
 *       - Cache the result (invalidate on new orders, or refresh every hour)
 *       - Update `rankingSource` to `"order_analytics"`
 */
export async function getBestSellerProducts(limit: number) {
  const items = await db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: productCardSelect
  });

  return {
    items,
    rankingSource: "merchandising_proxy" as const
  };
}

export async function getShopByApplicationData(limitPerCategory: number) {
  const applications = await db.shopApplication.findMany({
    where: {
      status: CategoryStatus.ACTIVE,
    },
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
      products: {
        where: {
          status: ProductStatus.ACTIVE
        },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        take: limitPerCategory,
        select: productCardSelect
      }
    }
  });

  return applications;
}

export async function searchProducts(params: SearchProductsParams) {
  const trimmedQuery = params.query.trim();

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    OR: [
      { name: { contains: trimmedQuery, mode: "insensitive" } },
      { slug: { contains: trimmedQuery, mode: "insensitive" } },
      { shortDescription: { contains: trimmedQuery, mode: "insensitive" } },
      { description: { contains: trimmedQuery, mode: "insensitive" } },
      {
        category: {
          name: { contains: trimmedQuery, mode: "insensitive" }
        }
      },
      {
        category: {
          slug: { contains: trimmedQuery, mode: "insensitive" }
        }
      }
    ]
  };

  const [items, total] = await db.$transaction([
    db.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      select: productCardSelect
    }),
    db.product.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit))
    }
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      status: ProductStatus.ACTIVE
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      status: true,
      basePrice: true,
      compareAtPrice: true,
      sku: true,
      stockQuantity: true,
      isFeatured: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          imageUrl: true,
          altText: true,
          isPrimary: true,
          sortOrder: true
        }
      },
      variants: {
        where: {
          status: ProductVariantStatus.ACTIVE
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          sku: true,
          size: true,
          color: true,
          material: true,
          priceOverride: true,
          stockQuantity: true,
          status: true
        }
      }
    }
  });
}
