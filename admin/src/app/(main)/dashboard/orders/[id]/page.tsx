'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, Product } from '@/shared/types';
import { getOrderById, updateOrderStatus } from '@/features/orders/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  'e-wallet': 'Ví điện tử',
  credit_card: 'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  paypal: 'PayPal',
  momo: 'Ví MoMo',
  zalopay: 'ZaloPay',
};

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && '$numberDecimal' in (v as Record<string, unknown>)) {
    return parseFloat((v as Record<string, string>).$numberDecimal) || 0;
  }
  return parseFloat(String(v ?? 0)) || 0;
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
      toast.error(error.message || 'Lỗi cập nhật trạng thái đơn hàng');
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

  const currentStatus = order.status || 'pending';
  const isFinalStatus = currentStatus === 'delivered' || currentStatus === 'cancelled';
  const userObj = typeof order.user_id === 'object' && order.user_id ? order.user_id : null;
  const items = order.items || [];
  const calculatedSubtotal = items.reduce((sum, item) => sum + toNum(item.price) * item.quantity, 0);

  return (
    <div className="space-y-6">
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
        <div className="md:col-span-2 space-y-6">
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
                  value={currentStatus}
                  onValueChange={(value) => updateStatusMutation.mutate({ id, status: value })}
                  disabled={updateStatusMutation.isPending || isFinalStatus}
                >
                  <SelectTrigger className="w-[200px]">
                    <Badge variant="outline">
                      {statusLabels[currentStatus] || currentStatus}
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
              {isFinalStatus && (
                <p className="text-xs text-muted-foreground">
                  Đơn hàng đã ở trạng thái cuối ({statusLabels[currentStatus]}), không thể thay đổi thêm.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã đặt ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Không có sản phẩm trong đơn hàng
                  </p>
                ) : (
                  items.map((item) => {
                    const rawProduct = item.laptop_id || item.product_id;
                    const product: Product | null =
                      rawProduct && typeof rawProduct === 'object' ? (rawProduct as Product) : null;
                    const unitPrice = toNum(item.price);

                    return (
                      <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0">
                        {product?.images?.mainImg?.url && (
                          <img
                            src={product.images.mainImg.url}
                            alt={product.title || product.name}
                            className="w-20 h-20 object-contain rounded border bg-white"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {product?.title || product?.name || item.product_name || 'Sản phẩm không còn tồn tại'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product?.sku || 'N/A'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">Số lượng: {item.quantity}</span>
                            <span className="text-sm font-medium">
                              {unitPrice.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(unitPrice * item.quantity).toLocaleString('vi-VN')}đ
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
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Họ tên</p>
                <p className="font-medium">{userObj?.name || order.shipping_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userObj?.email || 'N/A'}</p>
              </div>
              {(userObj?.phone || order.shipping_phone) && (
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{userObj?.phone || order.shipping_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ nhận hàng</p>
                <p className="font-medium">{order.shipping_address || 'Chưa cung cấp'}</p>
              </div>
              {order.note && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium">{order.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính sản phẩm:</span>
                <span>{calculatedSubtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Tổng cộng:</span>
                <span className="text-primary">{Number(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
