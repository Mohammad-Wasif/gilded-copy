# Phase 2A Data Model

This document locks the catalog schema for Phase 2A only. It defines the catalog entities, field intent, relationship rules, and the items intentionally deferred to later phases.

## Included Models

- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`

## Excluded Scope

- Authentication and users
- Cart and checkout
- Orders and payments
- Reviews and ratings
- Admin audit logs
- Search, recommendations, and analytics

## Core Decisions

- Categories support nesting through `parentId`.
- Categories use a single `primaryImageUrl` instead of a category image gallery.
- Products belong to exactly one category.
- Products support both simple and configurable inventory:
  - simple products can use `Product.sku` and `Product.stockQuantity`
  - configurable products can use `ProductVariant` rows instead
- Product images are stored in a dedicated `ProductImage` table with `isPrimary` and `sortOrder`.
- Product visibility is controlled by enums instead of free-form strings.
- Product slugs and category slugs are globally unique.

## Status Rules

- `CategoryStatus.ACTIVE`: category may be shown publicly.
- `CategoryStatus.INACTIVE`: category exists but should not be promoted publicly.
- `CategoryStatus.ARCHIVED`: category is retired and should stay hidden.
- `ProductStatus.DRAFT`: product is not public.
- `ProductStatus.ACTIVE`: product is public.
- `ProductStatus.ARCHIVED`: product is hidden but retained.
- `ProductVariantStatus.ACTIVE`: variant can be selected.
- `ProductVariantStatus.INACTIVE`: variant exists but is not currently offered.
- `ProductVariantStatus.ARCHIVED`: variant is retained for history and hidden.

## Relationship Rules

- One category can have many child categories.
- One category can have many products.
- One product belongs to one category.
- One product can have many images.
- One product can have zero or many variants.
- Category deletion is restricted when children or products still reference it.
- Product deletion cascades to images and variants.

## Index and Uniqueness Rules

- Unique:
  - `Category.slug`
  - `Product.slug`
  - `Product.sku`
  - `ProductVariant.sku`
- Indexed:
  - `Category.parentId`
  - `Category.status`
  - `Product.categoryId`
  - `Product.status`
  - `Product.isFeatured`
  - `ProductImage.productId`
  - `ProductVariant.productId`
  - `ProductVariant.status`

## Deferred Decisions

- Rich variant option tables such as `option_types` and `option_values`
- Multi-category product assignments
- Product tags and collections
- Inventory reservations and low-stock alerts
- Currency support and region-specific pricing
- Asset metadata such as image dimensions and transforms
