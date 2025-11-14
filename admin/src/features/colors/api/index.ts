import { COLOR_ENDPOINTS } from '@/constants/api-url';
import { fetchWithAuth } from '@/lib/apiClient';

export interface Color {
  _id: string;
  name: string;
  hex?: string;
}

export const getColors = async (): Promise<Color[]> => {
  const response = await fetchWithAuth(COLOR_ENDPOINTS.LIST);
  const data = await response.json();
  return data.data || [];
};

export const getColorById = async (id: string): Promise<Color> => {
  const response = await fetchWithAuth(COLOR_ENDPOINTS.DETAIL(id));
  const data = await response.json();
  return data.data;
};

export const createColor = async (color: Partial<Color>): Promise<Color> => {
  const response = await fetchWithAuth(COLOR_ENDPOINTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(color),
  });
  const data = await response.json();
  return data.data;
};

export const updateColor = async (id: string, color: Partial<Color>): Promise<Color> => {
  const response = await fetchWithAuth(COLOR_ENDPOINTS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(color),
  });
  const data = await response.json();
  return data.data;
};

export const deleteColor = async (id: string): Promise<void> => {
  await fetchWithAuth(COLOR_ENDPOINTS.DELETE(id), {
    method: 'DELETE',
  });
};
