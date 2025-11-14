import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNews, createNews, updateNews, deleteNews } from '../api';
import { News, NewsFormData } from '@/shared/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export const useNews = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['news'],
    queryFn: getNews,
    enabled: !!token,
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsData: NewsFormData) => createNews(newsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Tạo bài viết mới thành công');
    },
    onError: (error) => {
      toast.error(`Tạo bài viết mới thất bại: ${error.message}`);
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsFormData> }) =>
      updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Cập nhật bài viết thành công');
    },
    onError: (error) => {
      toast.error(`Cập nhật bài viết thất bại: ${error.message}`);
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Xóa bài viết thành công');
    },
    onError: (error) => {
      toast.error(`Xóa bài viết thất bại: ${error.message}`);
    },
  });
};
