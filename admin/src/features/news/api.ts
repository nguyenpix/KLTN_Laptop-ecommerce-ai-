import { NEWS_ENDPOINTS } from '@/constants/api-url';
import { News, NewsFormData } from '@/shared/types';
import { fetchWithAuth } from '@/lib/apiClient';

export const getNews = async (): Promise<News[]> => {
  const res = await fetchWithAuth(NEWS_ENDPOINTS.LIST);

  if (!res.ok) {
    throw new Error('Failed to fetch news');
  }

  const data = await res.json();
  return data.data;
};

export const createNews = async (newsData: NewsFormData): Promise<News> => {
  const res = await fetchWithAuth(NEWS_ENDPOINTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(newsData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to create news' }));
    throw new Error(errorData.message || 'Failed to create news');
  }

  const data = await res.json();
  return data.data;
};

export const updateNews = async (id: string, newsData: Partial<NewsFormData>): Promise<News> => {
  const res = await fetchWithAuth(NEWS_ENDPOINTS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(newsData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to update news' }));
    throw new Error(errorData.message || 'Failed to update news');
  }

  const data = await res.json();
  return data.data;
};

export const deleteNews = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(NEWS_ENDPOINTS.DELETE(id), {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to delete news' }));
    throw new Error(errorData.message || 'Failed to delete news');
  }
};
