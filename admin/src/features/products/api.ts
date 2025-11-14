import { PRODUCT_ENDPOINTS } from '@/constants/api-url';
import { Product, ProductFormData, PaginatedResponse, QueryParams } from '@/shared/types';
import { fetchWithAuth } from '@/lib/apiClient';

export const getProducts = async (params?: QueryParams): Promise<PaginatedResponse<Product>> => {
  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
  const res = await fetchWithAuth(PRODUCT_ENDPOINTS.LIST + queryString);

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return await res.json();
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await fetchWithAuth(PRODUCT_ENDPOINTS.DETAIL(id));

  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  const data = await res.json();
  return data.data;
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const res = await fetchWithAuth(PRODUCT_ENDPOINTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    throw new Error('Failed to create product');
  }

  const data = await res.json();
  return data.data;
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product> => {
  const res = await fetchWithAuth(PRODUCT_ENDPOINTS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    throw new Error('Failed to update product');
  }

  const data = await res.json();
  return data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(PRODUCT_ENDPOINTS.DELETE(id), {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete product');
  }
};
