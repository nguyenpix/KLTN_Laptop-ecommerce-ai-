'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Pagination } from '@/shared/components/ui/pagination';
import { Eye, Package2 } from 'lucide-react';
import { Order } from '@/shared/types';

// Constants for styling and labels


const statusLabels: { [key: string]: string } = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const paymentMethodLabels: { [key: string]: string } = {
  cod: 'COD',
  bank_transfer: 'Chuyển khoản',
  credit_card: 'Thẻ tín dụng',
};

type PaymentMethodKey = keyof typeof paymentMethodLabels;

// Main component
export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');

  const { data, isLoading, isError } = useOrders({
    page,
    limit: 10,
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  const handleViewDetail = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý đơn hàng</CardTitle>
        <CardDescription>Quản lý và theo dõi trạng thái đơn hàng của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        )}

        {isError && (
          <div className="flex justify-center py-8">
            <p className="text-red-500">Lỗi khi tải dữ liệu đơn hàng.</p>
          </div>
        )}

        {data && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Phương thức TT</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Package2 className="h-8 w-8 text-muted-foreground"/>
                          <span>Không có đơn hàng nào.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.data.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order._id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{typeof order.user_id === 'object' ? order.user_id.name : 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{typeof order.user_id === 'object' ? order.user_id.email : ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.total_amount.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paymentMethodLabels[order.payment_method as PaymentMethodKey] || order.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(order._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
