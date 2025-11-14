'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ limit: 1 });
  const { data: ordersData, isLoading: isLoadingOrders } = useOrders({ limit: 5, sort: '-createdAt' });

  const isLoading = isLoadingProducts || isLoadingOrders;

  const totalProducts = productsData?.total || 0;
  const totalOrders = ordersData?.total || 0;
  const recentOrders = ordersData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan nhanh về hoạt động của cửa hàng.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tổng sản phẩm</span>
                <span className="font-semibold">{totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tổng đơn hàng</span>
                <span className="font-semibold">{totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Đơn hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <TableRow key={order._id} className="cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order._id}`)}>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.total_amount.toLocaleString('vi-VN')}đ</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Không có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
