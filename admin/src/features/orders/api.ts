import { ORDER_ENDPOINTS } from '@/constants/api-url';
import { Order, PaginatedResponse, QueryParams } from '@/shared/types';
import { fetchWithAuth } from '@/lib/apiClient';

export const getOrders = async (params?: QueryParams): Promise<PaginatedResponse<Order>> => {
  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
  const res = await fetchWithAuth(ORDER_ENDPOINTS.LIST + queryString);

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  const resData = await res.json();
  
  return {
    success: resData.success,
    data: resData.data, 
    total: resData.pagination.total,
    page: resData.pagination.current,
    totalPages: resData.pagination.pages
  };
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await fetchWithAuth(ORDER_ENDPOINTS.DETAIL(id));

  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }

  const resData = await res.json();
  return resData.data; 
};

export const updateOrderStatus = async ({ id, status }: { id: string, status: string }): Promise<Order> => {
  const res = await fetchWithAuth(ORDER_ENDPOINTS.UPDATE_STATUS(id), {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update order status');
  }

  const resData = await res.json();
  return resData.data;
};


