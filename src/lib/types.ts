export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'HIDDEN' | 'ARCHIVED';
export type CategoryStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ProductVariantStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryImageUrl: string | null;
  thumbnailImageUrl?: string | null;
  bannerImageUrl?: string | null;
  status: CategoryStatus;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  parentId?: string | null;
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

export interface ShopApplication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  priceAtPurchase: string | number;
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string | number;
  shippingFee: string | number;
  shippingName: string;
  shippingPhone: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ─── Admin Types ─────────────────────────────────────────────────────

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  imageUrl: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: LowStockProduct[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  shippingName: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminOrderListItem extends AdminOrder {
  shippingPhone: string | null;
  shippingAddress: string;
  shippingZip: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    priceAtPurchase: number;
    quantity: number;
  }>;
}

export interface AdminOrdersResponse {
  success: boolean;
  data: AdminOrderListItem[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminCategory {
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
  createdAt: string;
  updatedAt: string;
  productCount: number;
  childCount: number;
  children: AdminCategory[];
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  primaryImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  bannerImageUrl?: string | null;
  status: Extract<CategoryStatus, 'ACTIVE' | 'INACTIVE'>;
  sortOrder?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

// ─── Admin Product Types ──────────────────────────────────────────────

export interface AdminProductVariant {
  id: string;
  title: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  finish: string | null;
  imageUrl: string | null;
  status: ProductVariantStatus;
  priceOverride: number | null;
  stockQuantity: number;
  sortOrder: number;
}

export interface AdminProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice: number | null;
  discountPrice: number | null;
  purchasePrice: number | null;
  sku: string;
  stockQuantity: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  sortOrder: number;
  tags: string[];
  supplier: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parent: { id: string; name: string; slug: string } | null;
  };
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  applications: ShopApplication[];
  variantCount: number;
  orderCount: number;
}

export interface AdminProductVariantInput {
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
  variants?: AdminProductVariantInput[];
}

export interface AdminProductStats {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentlyAddedCount: number;
}

export interface ProductLog {
  id: string;
  productId: string;
  action: string;
  details: string | null;
  adminId: string | null;
  adminName: string | null;
  createdAt: string;
}

export interface AdminProductsResponse {
  success: boolean;
  data: AdminProduct[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminStockOverview {
  products: AdminProduct[];
  outOfStock: AdminProduct[];
  lowStock: AdminProduct[];
  healthy: AdminProduct[];
}
