'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/constants/api-url';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  laptop_id: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user_id: { _id: string; name: string; email: string };
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[]; // Populated on detail view
}

export default function OrderHistoryPage() {
  const { token, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10; // Items per page

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const { data, isLoading, isError, error } = useQuery<{
    success: boolean;
    data: Order[];
    pagination: { current: number; pages: number; total: number };
  }>({
    queryKey: ['myOrders', page],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token found.');
      const response = await fetch(`${API_URL}/orders/my-orders?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!token, // Only run query if token exists
  });

  // Conditional rendering starts here, after all hooks are called
  if (!isLoggedIn) {
    return <div className="container mx-auto py-12 text-center">Đang chuyển hướng...</div>;
  }

  if (isLoading) return <div className="container mx-auto py-12 text-center">Đang tải lịch sử đơn hàng...</div>;
  if (isError) return <div className="container mx-auto py-12 text-center text-red-500">Lỗi: {error?.message || 'Không thể tải lịch sử đơn hàng.'}</div>;

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Lịch sử đơn hàng của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-muted-foreground text-lg">
              <p className="mb-4">Bạn chưa có đơn hàng nào.</p>
              <Link href="/products">
                <Button>Tiếp tục mua sắm</Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order._id}</TableCell>
                      <TableCell>{order.total_amount.toLocaleString('vi-VN')}đ</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Link href={`/profile/orders/${order._id}`}>
                          <Button variant="outline" size="sm">Xem</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  {[...Array(pagination.pages)].map((_, index) => (
                    <Button
                      key={index}
                      variant={page === index + 1 ? 'default' : 'outline'}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                    disabled={page === pagination.pages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
