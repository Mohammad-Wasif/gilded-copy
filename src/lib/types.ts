export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type CategoryStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type ProductVariantStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryImageUrl: string | null;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Category[];
  products?: Product[];
  _count?: {
    children: number;
    products: number;
  };
}

export interface ProductImage {
  id?: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  size: string | null;
  color: string | null;
  material: string | null;
  priceOverride: string | null; // Decimal represented as string
  stockQuantity: number;
  sku: string;
  status?: ProductVariantStatus;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  status: ProductStatus;
  basePrice: string; // Decimal
  compareAtPrice: string | null; // Decimal
  sku: string;
  stockQuantity: number;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: Record<string, any>;
    query?: string;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ShopApplication extends Category {
  applicationKey: string;
  applicationLabel: string;
}
