import { API_BASE_URL } from '@/constants/api-url';
import { fetchWithAuth } from '@/lib/apiClient';

const BRAND_ENDPOINTS = {
  LIST: `${API_BASE_URL}/brands`,
  DETAIL: (id: string) => `${API_BASE_URL}/brands/${id}`,
  CREATE: `${API_BASE_URL}/brands`,
  UPDATE: (id: string) => `${API_BASE_URL}/brands/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/brands/${id}`,
};

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

export const getBrands = async (): Promise<Brand[]> => {
  const response = await fetchWithAuth(BRAND_ENDPOINTS.LIST);
  const data = await response.json();
  return data.data || [];
};

export const getBrandById = async (id: string): Promise<Brand> => {
  const response = await fetchWithAuth(BRAND_ENDPOINTS.DETAIL(id));
  const data = await response.json();
  return data.data;
};

export const createBrand = async (brand: Partial<Brand>): Promise<Brand> => {
  const response = await fetchWithAuth(BRAND_ENDPOINTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(brand),
  });
  const data = await response.json();
  return data.data;
};

export const updateBrand = async (id: string, brand: Partial<Brand>): Promise<Brand> => {
  const response = await fetchWithAuth(BRAND_ENDPOINTS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(brand),
  });
  const data = await response.json();
  return data.data;
};

export const deleteBrand = async (id: string): Promise<void> => {
  await fetchWithAuth(BRAND_ENDPOINTS.DELETE(id), {
    method: 'DELETE',
  });
};
