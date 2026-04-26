import { ProductStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import {
  getBestSellerProducts,
  getCategoryTree,
  getCategoryBySlug,
  getFeaturedProducts,
  getProductBySlug,
  getShopByApplicationData,
  listCategories,
  listProducts,
  searchProducts
} from "../modules/catalog/catalog.service";

export const catalogRouter = Router();

const booleanQuery = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return value.toLowerCase() === "true";
  });

const categoriesQuerySchema = z.object({
  parentSlug: z.string().trim().min(1).optional()
});

const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().trim().min(1).optional(),
  application: z.string().trim().min(1).optional(),
  featured: booleanQuery.optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc", "name_desc"]).default("newest")
});

const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(8)
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

// ──────────────────────────────────────────────────
// Route ordering matters!
//
// Express matches routes top-to-bottom. Static segments
// MUST be registered before dynamic `:slug` params to avoid
// shadowing. Current order:
//
//   1. /categories           (list)
//   2. /categories/tree      (static → before :slug)
//   3. /categories/:slug     (dynamic)
//   4. /products/featured    (static → before :slug)
//   5. /products/best-sellers(static → before :slug)
//   6. /products/by-category/:slug
//   7. /products             (list, no param conflict)
//   8. /shop-by-application
//   9. /search
//  10. /products/:slug       (dynamic — must be LAST in /products)
// ──────────────────────────────────────────────────

// NOTE: Express 5 automatically forwards rejected promises from
// async handlers to error middleware, so bare `async (req, res)`
// without try/catch is safe. Zod `.parse()` throws ZodError on
// invalid input, which the global errorHandler converts to 4xx.

catalogRouter.get("/categories", async (req, res) => {
  const query = categoriesQuerySchema.parse(req.query);
  const categories = await listCategories(query);

  res.status(200).json({
    success: true,
    data: categories
  });
});

catalogRouter.get("/categories/tree", async (_req, res) => {
  const tree = await getCategoryTree();

  res.status(200).json({
    success: true,
    data: tree
  });
});

catalogRouter.get("/categories/:slug", async (req, res) => {
  const { slug } = z.object({ slug: z.string().trim().min(1) }).parse(req.params);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    const notFoundError = new Error(`Category not found: ${slug}`) as Error & { statusCode?: number };
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

catalogRouter.get("/products/featured", async (req, res) => {
  const { limit } = limitQuerySchema.parse(req.query);
  const products = await getFeaturedProducts(limit);

  res.status(200).json({
    success: true,
    data: products
  });
});

catalogRouter.get("/products/best-sellers", async (req, res) => {
  const { limit } = limitQuerySchema.parse(req.query);
  const result = await getBestSellerProducts(limit);

  res.status(200).json({
    success: true,
    data: result.items,
    meta: {
      rankingSource: result.rankingSource
    }
  });
});

catalogRouter.get("/products/by-category/:slug", async (req, res) => {
  const { slug } = z.object({ slug: z.string().trim().min(1) }).parse(req.params);
  const query = productsQuerySchema.parse({
    ...req.query,
    category: slug
  });
  const products = await listProducts(query);

  res.status(200).json({
    success: true,
    data: products.items,
    meta: {
      pagination: products.pagination,
      filters: {
        category: slug,
        featured: query.featured ?? null,
        status: query.status ?? ProductStatus.ACTIVE,
        sort: query.sort
      }
    }
  });
});

catalogRouter.get("/products", async (req, res) => {
  const query = productsQuerySchema.parse(req.query);
  const products = await listProducts(query);

  res.status(200).json({
    success: true,
    data: products.items,
    meta: {
      pagination: products.pagination,
      filters: {
        category: query.category ?? null,
        featured: query.featured ?? null,
        status: query.status ?? ProductStatus.ACTIVE,
        sort: query.sort
      }
    }
  });
});

catalogRouter.get("/shop-by-application", async (req, res) => {
  const { limit } = limitQuerySchema.parse(req.query);
  const applications = await getShopByApplicationData(limit);

  res.status(200).json({
    success: true,
    data: applications,
    meta: {
      source: "top_level_categories"
    }
  });
});

catalogRouter.get("/search", async (req, res) => {
  const query = searchQuerySchema.parse(req.query);
  const results = await searchProducts({
    query: query.q,
    page: query.page,
    limit: query.limit
  });

  res.status(200).json({
    success: true,
    data: results.items,
    meta: {
      query: query.q,
      pagination: results.pagination
    }
  });
});

// Dynamic :slug — must be the LAST /products route to avoid shadowing
catalogRouter.get("/products/:slug", async (req, res) => {
  const { slug } = z.object({ slug: z.string().trim().min(1) }).parse(req.params);
  const product = await getProductBySlug(slug);

  if (!product) {
    const notFoundError = new Error(`Product not found: ${slug}`) as Error & { statusCode?: number };
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  res.status(200).json({
    success: true,
    data: product
  });
});
