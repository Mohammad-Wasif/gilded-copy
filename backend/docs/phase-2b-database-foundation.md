# Phase 2B Database Foundation

Phase 2B turns the approved catalog schema into a real PostgreSQL baseline with migration history and deterministic sample data.

## Migration Baseline

- Initial migration folder: `prisma/migrations/20260407164500_init_catalog`
- Migration status: recorded as applied and verified as up to date
- Database tables present:
  - `_prisma_migrations`
  - `categories`
  - `products`
  - `product_images`
  - `product_variants`

## Seed Workflow

- Seed command: `npm run prisma:seed`
- Seed behavior:
  - clears variants, images, products, and categories in dependency-safe order
  - recreates a deterministic sample catalog
  - supports nested categories, simple products, configurable products, images, and featured flags

## Seeded Dataset Summary

- Categories: 8
- Products: 10
- Product images: 11
- Product variants: 7

## Verified Integrity Checks

- Category nesting is valid for women, men, and home decor branches.
- Product-to-category links are valid.
- Product image and product variant relations are valid.
- Orphan checks returned zero for products, images, and variants.
- Migration status reports the database schema is up to date.

## Local Workflow

```powershell
cd .\backend
npm run prisma:generate
npm run prisma:seed
npx prisma migrate status
```

## Notes

- Prisma 7 runtime access now uses the PostgreSQL driver adapter.
- `DIRECT_URL` is used by Prisma CLI commands through `prisma.config.ts`.
- `DATABASE_URL` is used by the runtime Prisma client and seed script.
