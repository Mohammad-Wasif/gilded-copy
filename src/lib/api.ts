import { Category, PaginatedResponse, Product, ShopApplication, SingleResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  catalog: {
    getCategories: () => fetchApi<SingleResponse<Category[]>>('/catalog/categories'),
    getCategoryTree: () => fetchApi<SingleResponse<Category[]>>('/catalog/categories/tree'),
    getCategoryBySlug: (slug: string) => fetchApi<SingleResponse<Category>>(`/catalog/categories/${slug}`),
    
    getProducts: (params?: { page?: number; limit?: number; category?: string; featured?: boolean; sort?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.append('page', params.page.toString());
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.category) qs.append('category', params.category);
      if (params?.featured !== undefined) qs.append('featured', String(params.featured));
      if (params?.sort) qs.append('sort', params.sort);
      
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      return fetchApi<PaginatedResponse<Product>>(`/catalog/products${queryStr}`);
    },
    
    getProductsByCategory: (slug: string, params?: { page?: number; limit?: number; sort?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.append('page', params.page.toString());
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.sort) qs.append('sort', params.sort);
      
      const queryStr = qs.toString() ? `?${qs.toString()}` : '';
      return fetchApi<PaginatedResponse<Product>>(`/catalog/products/by-category/${slug}${queryStr}`);
    },
    
    getFeaturedProducts: (limit: number = 8) => fetchApi<SingleResponse<Product[]>>(`/catalog/products/featured?limit=${limit}`),
    getBestSellers: (limit: number = 8) => fetchApi<SingleResponse<Product[]> & { meta: { rankingSource: string } }>(`/catalog/products/best-sellers?limit=${limit}`),
    getShopByApplication: (limit: number = 4) => fetchApi<SingleResponse<ShopApplication[]>>(`/catalog/shop-by-application?limit=${limit}`),
    getProductBySlug: (slug: string) => fetchApi<SingleResponse<Product>>(`/catalog/products/${slug}`),
    
    searchProducts: (query: string, page: number = 1, limit: number = 12) => {
      const qs = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
      return fetchApi<PaginatedResponse<Product>>(`/catalog/search?${qs.toString()}`);
    }
  }
};
