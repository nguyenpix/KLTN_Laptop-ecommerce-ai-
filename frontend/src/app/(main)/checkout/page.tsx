'use client';

import { API_URL } from '@/constants/api-url';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

// Schema cho toàn bộ form
const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  paymentMethod: z.enum(['cod', 'e-wallet']).refine((val) => val !== undefined, {
    message: 'Phương thức thanh toán là bắt buộc',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const { user, token } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const totalAmount = getTotalPrice();
  const shippingCost = 100000;
  const taxRate = 0.08; // 8% VAT
  const taxAmount = totalAmount * taxRate;
  const finalTotal = totalAmount + shippingCost + taxAmount;

  // Khởi tạo form với schema bao gồm paymentMethod
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      paymentMethod: 'cod', // Giá trị mặc định
    },
  });



// ... (rest of imports)

// ... (component code)

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (orderData: Record<string, unknown>) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Tạo đơn hàng thất bại');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Đặt hàng thành công!');
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push('/order-success');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });

  function onShippingSubmit() {
    setStep('payment');
  }

  function onPaymentSubmit() {
    setStep('review');
  }

  function handlePlaceOrder(data: CheckoutFormValues) {
    if (!user) {
      toast.error('Thông tin người dùng không đầy đủ');
      return;
    }

    const orderData = {
      user_id: user.id,
      total_amount: finalTotal,
      shipping_address: data.address,
      payment_method: data.paymentMethod,
      order_items: items.map((item) => ({
        laptop_id: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    createOrder(orderData);
  }

  const renderStep = () => {
    switch (step) {
      case 'shipping':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bước 1: Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onShippingSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Tiếp tục đến thanh toán</Button>
              </form>
            </CardContent>
          </Card>
        );
      case 'payment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bước 2: Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn phương thức thanh toán</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="cod" />
                          </FormControl>
                          <FormLabel className="font-normal">Thanh toán khi nhận hàng (COD)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="e-wallet" />
                          </FormControl>
                          <FormLabel className="font-normal">Thanh toán bằng ví điện tử</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('shipping')}>
                  Quay lại
                </Button>
                <Button onClick={form.handleSubmit(onPaymentSubmit)}>Tiếp tục đến xác nhận</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'review':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bước 3: Xác nhận đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">Thông tin giao hàng</h3>
                <p>{form.getValues('fullName')}</p>
                <p>{form.getValues('email')}</p>
                <p>{form.getValues('phone')}</p>
                <p>{form.getValues('address')}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Phương thức thanh toán</h3>
                <p>{form.getValues('paymentMethod') === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Ví điện tử'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Tổng kết đơn hàng</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
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
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('payment')} disabled={isPending}>
                  Quay lại
                </Button>
                <Button onClick={form.handleSubmit(handlePlaceOrder)} disabled={isPending}>
                  {isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <FormProvider {...form}>{renderStep()}</FormProvider>
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm trong giỏ</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => {
                if (!item || !item.product || !item.product.images || !item.product.images.mainImg) {
                  return null;
                }
                return (
                  <div key={item.product._id} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={item.product.images.mainImg.url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                  </div>
                );
              })}
              <Separator />
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}