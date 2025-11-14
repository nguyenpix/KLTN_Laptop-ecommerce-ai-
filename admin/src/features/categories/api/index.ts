import { CATEGORY_ENDPOINTS } from '@/constants/api-url';
import { fetchWithAuth } from '@/lib/apiClient';

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetchWithAuth(CATEGORY_ENDPOINTS.LIST);
  const data = await response.json();
  return data.data || [];
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await fetchWithAuth(CATEGORY_ENDPOINTS.DETAIL(id));
  const data = await response.json();
  return data.data;
};

export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const response = await fetchWithAuth(CATEGORY_ENDPOINTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(category),
  });
  const data = await response.json();
  return data.data;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  const response = await fetchWithAuth(CATEGORY_ENDPOINTS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(category),
  });
  const data = await response.json();
  return data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await fetchWithAuth(CATEGORY_ENDPOINTS.DELETE(id), {
    method: 'DELETE',
  });
};
