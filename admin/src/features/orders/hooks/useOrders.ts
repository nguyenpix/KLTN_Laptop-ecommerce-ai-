import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById, updateOrderStatus } from '../api';
import { QueryParams, Order, OrderStatus } from '@/shared/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export const useOrders = (params?: QueryParams) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    enabled: !!token,
  });
};

export const useOrder = (id: string) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id),
    enabled: !!id && !!token,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    },
    onError: () => {
      toast.error('Cập nhật trạng thái đơn hàng thất bại');
    },
  });
};
