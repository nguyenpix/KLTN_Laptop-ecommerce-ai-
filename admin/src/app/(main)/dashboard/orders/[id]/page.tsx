'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '@/shared/types';
import { getOrderById, updateOrderStatus } from '@/features/orders/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  ArrowLeft, Package, User, MapPin, CreditCard, Clock, 
  CheckCircle, XCircle, Truck, DollarSign 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';



const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const paymentMethodLabels: Record<string, string> = {
  cod: 'COD (Thanh toán khi nhận hàng)',
  credit_card: 'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  paypal: 'PayPal',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success('Cập nhật trạng thái đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error('Lỗi cập nhật trạng thái đơn hàng', {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
              <p className="text-muted-foreground mb-4">
                Đơn hàng không tồn tại hoặc đã bị xóa.
              </p>
              <Button onClick={() => router.push('/dashboard/orders')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Đơn hàng #{order._id}
            </h1>
            <p className="text-muted-foreground mt-1">
              Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {}
        <div className="md:col-span-2 space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Quản lý trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Trạng thái đơn hàng:</span>
                </div>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateStatusMutation.mutate({ id, status: value })}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[200px]">
                    <Badge variant="outline">
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(!order.items || order.items.length === 0) ? (
                  <p className="text-center text-muted-foreground py-4">
                    Không có sản phẩm trong đơn hàng
                  </p>
                ) : (
                  order.items.map((item) => {
                    const product = typeof item.product_id === 'object' ? item.product_id : null;
                    return (
                      <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0">
                        {product?.images?.mainImg?.url && (
                          <img
                            src={product.images.mainImg.url}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{product?.name || item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product?.sku || 'N/A'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">Số lượng: {item.quantity}</span>
                            <span className="text-sm font-medium">
                              {item.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <p className="font-medium">
                  {typeof order.user_id === 'object' ? order.user_id.name : order.shipping_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">
                  {typeof order.user_id === 'object' ? order.user_id.email : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">
                  {order.shipping_phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Người nhận</p>
                <p className="font-medium">{order.shipping_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">
                  {order.shipping_address}
                </p>
                {order.shipping_district && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.shipping_district}
                  </p>
                )}
                {order.shipping_city && (
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_city}
                  </p>
                )}
              </div>
              {order.note && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium">{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="font-medium">
                  {paymentMethodLabels[order.payment_method] || order.payment_method}
                </span>
              </div>
              {order.subtotal !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{order.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {order.discount !== undefined && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{order.discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              {order.shipping_fee !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span>{order.shipping_fee.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Tổng cộng:</span>
                <span className="text-primary">{order.total_amount.toLocaleString('vi-VN')}đ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
