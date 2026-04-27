import { AdminCategory, AdminCategoryInput, AdminOrder, AdminOrdersResponse, AdminProduct, AdminProductInput, AdminProductStats, AdminProductsResponse, AdminStockOverview, Category, DashboardStats, PaginatedResponse, Product, ProductLog, ShopApplication, SingleResponse } from './types';

// In production, this should be set via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '/api');

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error?.message || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

const cache = new Map<string, { promise: Promise<any>, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Executes a Promise-returning function, caching the Promise globally.
 * If multiple components call this simultaneously, they share the exact same Promise.
 */
function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.promise;
  }
  
  const promise = fetcher().catch(err => {
    cache.delete(key);
    throw err;
  });
  
  cache.set(key, { promise, timestamp: Date.now() });
  return promise;
}

export const api = {
  catalog: {
    getCategories: () => withCache('categories', () => fetchApi<SingleResponse<Category[]>>('/catalog/categories')),
    getCategoryTree: () => withCache('categories:tree', () => fetchApi<SingleResponse<Category[]>>('/catalog/categories/tree')),
    getCategoryBySlug: (slug: string) => withCache(`categories:${slug}`, () => fetchApi<SingleResponse<Category>>(`/catalog/categories/${slug}`)),
    
    getProducts: (params?: { page?: number; limit?: number; category?: string; application?: string; featured?: boolean; sort?: string; maxPrice?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.append('page', params.page.toString());
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.category) qs.append('category', params.category);
      if (params?.application) qs.append('application', params.application);
      if (params?.featured !== undefined) qs.append('featured', String(params.featured));
      if (params?.sort) qs.append('sort', params.sort);
      if (params?.maxPrice) qs.append('maxPrice', params.maxPrice.toString());
      
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      return fetchApi<PaginatedResponse<Product>>(`/catalog/products${queryStr}`);
    },
    
    getProductsByCategory: (slug: string, params?: { page?: number; limit?: number; sort?: string; maxPrice?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.append('page', params.page.toString());
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.sort) qs.append('sort', params.sort);
      if (params?.maxPrice) qs.append('maxPrice', params.maxPrice.toString());
      
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      return fetchApi<PaginatedResponse<Product>>(`/catalog/products/by-category/${slug}${queryStr}`);
    },
    
    getFeaturedProducts: (limit: number = 8) => withCache(`featured:${limit}`, () => fetchApi<SingleResponse<Product[]>>(`/catalog/products/featured?limit=${limit}`)),
    getBestSellers: (limit: number = 8) => withCache(`bestsellers:${limit}`, () => fetchApi<SingleResponse<Product[]> & { meta: { rankingSource: string } }>(`/catalog/products/best-sellers?limit=${limit}`)),
    getShopByApplication: (limit: number = 4) => withCache(`applications:${limit}`, () => fetchApi<SingleResponse<ShopApplication[]>>(`/catalog/shop-by-application?limit=${limit}`)),
    getProductBySlug: (slug: string) => fetchApi<SingleResponse<Product>>(`/catalog/products/${slug}`),
    
    searchProducts: (query: string, page: number = 1, limit: number = 12) => {
      const qs = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
      return fetchApi<PaginatedResponse<Product>>(`/catalog/search?${qs.toString()}`);
    }
  },
  cart: {
    get: () => fetchApi<any>('/cart'),
    sync: (items: any[]) => fetchApi<any>('/cart/sync', { method: 'POST', body: JSON.stringify({ items }) }),
    addItem: (productId: string, variantId?: string | null, quantity: number = 1) => 
      fetchApi<any>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, variantId, quantity }) }),
    updateItem: (itemId: string, quantity: number) => 
      fetchApi<any>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
    removeItem: (itemId: string) => 
      fetchApi<any>(`/cart/items/${itemId}`, { method: 'DELETE' })
  },
  orders: {
    createOrder: (shippingDetails: any) => 
      fetchApi<any>('/orders', { method: 'POST', body: JSON.stringify(shippingDetails) }),
    getOrders: () => fetchApi<any>('/orders'),
  },
  upload: {
    media: async (file: File) => {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
        } catch (e) {
          // Not JSON
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
  },
  settings: {
    get: (key: string) => fetchApi<any>(`/settings/${key}`),
  },
  admin: {
    getDashboardStats: () =>
      fetchApi<SingleResponse<DashboardStats>>('/admin/dashboard-stats'),
    getRecentOrders: (limit: number = 5) =>
      fetchApi<SingleResponse<AdminOrder[]>>(`/admin/recent-orders?limit=${limit}`),
    getAllOrders: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.append('page', params.page.toString());
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.status) qs.append('status', params.status);
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      return fetchApi<AdminOrdersResponse>(`/admin/orders${queryStr}`);
    },
    updateOrderStatus: (orderId: string, status: string) =>
      fetchApi<any>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    getCategoryTree: () =>
      fetchApi<SingleResponse<AdminCategory[]>>('/admin/categories/tree'),
    createCategory: (payload: AdminCategoryInput) =>
      fetchApi<SingleResponse<AdminCategory>>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateCategory: (categoryId: string, payload: AdminCategoryInput) =>
      fetchApi<SingleResponse<AdminCategory>>(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    updateCategoryStatus: (categoryId: string, status: AdminCategoryInput['status']) =>
      fetchApi<SingleResponse<AdminCategory>>(`/admin/categories/${categoryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    deleteCategory: (categoryId: string) =>
      fetchApi<SingleResponse<{ id: string }>>(`/admin/categories/${categoryId}`, {
        method: 'DELETE'
      }),
    hardDeleteCategory: (categoryId: string) =>
      fetchApi<SingleResponse<{ id: string; name: string }>>(`/admin/categories/${categoryId}/hard`, {
        method: 'DELETE'
      }),
    reorderCategories: (parentId: string | null, orderedIds: string[]) =>
      fetchApi<SingleResponse<AdminCategory[]>>('/admin/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ parentId, orderedIds })
      }),
    bulkUpdateCategories: (ids: string[], action: 'activate' | 'deactivate' | 'delete') =>
      fetchApi<SingleResponse<{ updatedIds: string[]; errors: string[] }>>('/admin/categories/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids, action })
      }),
    products: {
      getStockOverview: () =>
        fetchApi<SingleResponse<AdminStockOverview>>('/admin/products/stock-overview'),
      getStats: () =>
        fetchApi<SingleResponse<AdminProductStats>>('/admin/products/stats'),
      import: (rows: any[]) =>
        fetchApi<SingleResponse<any>>('/admin/products/import', {
          method: 'POST',
          body: JSON.stringify(rows)
        }),
      list: (params?: {
        page?: number; limit?: number; search?: string; categoryId?: string;
        status?: string; stockStatus?: string; supplier?: string;
        minPrice?: number; maxPrice?: number; sort?: string;
      }) => {
        const qs = new URLSearchParams();
        if (params?.page) qs.append('page', params.page.toString());
        if (params?.limit) qs.append('limit', params.limit.toString());
        if (params?.search) qs.append('search', params.search);
        if (params?.categoryId) qs.append('categoryId', params.categoryId);
        if (params?.status) qs.append('status', params.status);
        if (params?.stockStatus) qs.append('stockStatus', params.stockStatus);
        if (params?.supplier) qs.append('supplier', params.supplier);
        if (params?.minPrice !== undefined) qs.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) qs.append('maxPrice', params.maxPrice.toString());
        if (params?.sort) qs.append('sort', params.sort);
        const q = qs.toString() ? `?${qs.toString()}` : '';
        return fetchApi<AdminProductsResponse>(`/admin/products${q}`);
      },
      getById: (id: string) => fetchApi<SingleResponse<AdminProduct>>(`/admin/products/${id}`),
      create: (payload: AdminProductInput) =>
        fetchApi<SingleResponse<AdminProduct>>('/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
      update: (id: string, payload: AdminProductInput) =>
        fetchApi<SingleResponse<AdminProduct>>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
      delete: (id: string) =>
        fetchApi<SingleResponse<{ id: string; archived: boolean }>>(`/admin/products/${id}`, { method: 'DELETE' }),
      duplicate: (id: string) =>
        fetchApi<SingleResponse<AdminProduct>>(`/admin/products/${id}/duplicate`, { method: 'POST' }),
      adjustStock: (id: string, delta: number) =>
        fetchApi<SingleResponse<AdminProduct>>(`/admin/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
      bulk: (ids: string[], action: string) =>
        fetchApi<SingleResponse<{ updatedIds: string[]; errors: string[] }>>('/admin/products/bulk', { method: 'POST', body: JSON.stringify({ ids, action }) }),
      getLogs: (id: string) => fetchApi<SingleResponse<ProductLog[]>>(`/admin/products/${id}/logs`),
    },
    customers: {
      getStats: () => fetchApi<any>('/admin/customers/stats'),
      list: (params?: any) => {
        const qs = new URLSearchParams();
        if (params) {
          for (const [k, v] of Object.entries(params)) {
             if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
          }
        }
        const q = qs.toString() ? `?${qs.toString()}` : '';
        return fetchApi<any>(`/admin/customers${q}`);
      },
      getProfile: (id: string) => fetchApi<any>(`/admin/customers/${id}`),
      update: (id: string, data: any) => fetchApi<any>(`/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      logCommunication: (id: string, data: any) => fetchApi<any>(`/admin/customers/${id}/communication`, { method: 'POST', body: JSON.stringify(data) }),
      bulkAction: (userIds: string[], action: string, value: string) => fetchApi<any>('/admin/customers/bulk', { method: 'POST', body: JSON.stringify({ userIds, action, value }) })
    },
    misc: {
      getApplications: () => fetchApi<SingleResponse<any[]>>('/admin/misc/applications'),
      createApplication: (data: any) => fetchApi<SingleResponse<any>>('/admin/misc/applications', { method: 'POST', body: JSON.stringify(data) }),
      updateApplication: (id: string, data: any) => fetchApi<SingleResponse<any>>(`/admin/misc/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      deleteApplication: (id: string) => fetchApi<SingleResponse<any>>(`/admin/misc/applications/${id}`, { method: 'DELETE' }),
      getApplicationProducts: (id: string) => fetchApi<SingleResponse<any>>(`/admin/misc/applications/${id}/products`),
      updateApplicationProducts: (id: string, productIds: string[]) => fetchApi<SingleResponse<any>>(`/admin/misc/applications/${id}/products`, { method: 'PUT', body: JSON.stringify({ productIds }) }),
      searchProductsForApp: (q: string) => fetchApi<SingleResponse<any[]>>(`/admin/misc/products/search?q=${encodeURIComponent(q)}`)
    },
    settings: {
      update: (key: string, value: any) => fetchApi<any>(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) })
    }
  }
};
