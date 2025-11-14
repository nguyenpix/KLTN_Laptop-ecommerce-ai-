import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../api';
import { QueryParams, ProductFormData } from '@/shared/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export const useProducts = (params?: QueryParams) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    enabled: !!token,
    staleTime: 0, 
    refetchOnMount: 'always', 
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 0, 
    refetchOnMount: 'always', 
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Tạo sản phẩm thành công');
    },
    onError: () => {
      toast.error('Tạo sản phẩm thất bại');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Cập nhật sản phẩm thành công');
    },
    onError: () => {
      toast.error('Cập nhật sản phẩm thất bại');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: () => {
      toast.error('Xóa sản phẩm thất bại');
    },
  });
};
