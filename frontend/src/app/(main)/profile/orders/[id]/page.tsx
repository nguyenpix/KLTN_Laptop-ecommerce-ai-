'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/constants/api-url';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface ProductImage {
  url: string;
  alt_text?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { mainImg: ProductImage };
  brand_id: { name: string };
}

interface OrderItem {
  _id: string;
  laptop_id: Product; // Populated product details
  quantity: number;
  price: number; // Price at the time of order
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
  items: OrderItem[]; // Populated order items
}

export default function OrderDetailPage() {
  const { token, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const { data, isLoading, isError, error } = useQuery<{
    success: boolean;
    data: Order;
  }>({
    queryKey: ['orderDetail', orderId],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token found.');
      if (!orderId) throw new Error('Order ID is missing.');

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }
      return response.json();
    },
    enabled: !!token && !!orderId, // Only run query if token and orderId exist
  });

  if (!isLoggedIn) {
    return <div className="container mx-auto py-12 text-center">Đang chuyển hướng...</div>;
  }

  if (isLoading) return <div className="container mx-auto py-12 text-center">Đang tải chi tiết đơn hàng...</div>;
  if (isError) return <div className="container mx-auto py-12 text-center text-red-500">Lỗi: {error?.message || 'Không thể tải chi tiết đơn hàng.'}</div>;

  const order = data?.data;

  if (!order) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Đơn hàng bạn tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link href="/profile/orders">
              <Button>Quay lại lịch sử đơn hàng</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 100000; // Hardcoded as per previous discussion
  const taxRate = 0.08; // 8% VAT as per previous discussion
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + taxAmount;

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Chi tiết đơn hàng #{order._id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Thông tin chung</h3>
            <p><strong>Mã đơn hàng:</strong> {order._id}</p>
            <p><strong>Trạng thái:</strong> {order.status}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            <p><strong>Tổng tiền:</strong> {order.total_amount.toLocaleString('vi-VN')}đ</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Thông tin giao hàng</h3>
            <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
            <p><strong>Phương thức thanh toán:</strong> {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Ví điện tử'}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Sản phẩm trong đơn hàng</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead className="text-right">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <img src={item.laptop_id.images.mainImg.url} alt={item.laptop_id.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                        <span>{item.laptop_id.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.laptop_id.brand_id.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell className="text-right">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{shippingCost.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế (8%):</span>
                <span>{taxAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span>{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/profile/orders">
              <Button variant="outline">Quay lại lịch sử đơn hàng</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
