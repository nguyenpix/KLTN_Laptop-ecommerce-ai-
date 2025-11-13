'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto py-20 flex justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="mt-6 text-3xl font-bold">Đặt hàng thành công!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và sẽ sớm được xử lý.
            Bạn có thể xem lại lịch sử mua hàng trong trang cá nhân.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
            <Link href="/profile/orders">
              <Button variant="outline">Xem lịch sử đơn hàng</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
