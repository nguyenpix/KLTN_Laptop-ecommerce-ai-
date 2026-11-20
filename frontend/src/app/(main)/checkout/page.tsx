'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '@/constants/api-url';
import { useAuthStore, getUserId } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  address: z.string().min(1, 'Địa chỉ giao hàng là bắt buộc'),
  city: z.string().optional(),
  paymentMethod: z.enum(['cod', 'e-wallet']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'shipping' | 'review'>('shipping');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const { user, token, isLoggedIn } = useAuthStore();
  const { items, getTotalPrice, getTotalItems, resetCart } = useCartStore();

  const totalAmount = getTotalPrice();
  const shippingCost = 100000;
  const taxRate = 0.08;
  const taxAmount = Math.round(totalAmount * taxRate);
  const finalTotal = totalAmount + shippingCost + taxAmount;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: 'TP. Hồ Chí Minh',
      paymentMethod: 'cod',
    },
  });

  useEffect(() => {
    if (user && !form.formState.isDirty) {
      form.reset({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: form.getValues('city') || 'TP. Hồ Chí Minh',
        paymentMethod: form.getValues('paymentMethod') || 'cod',
      });
    }
  }, [user, form]);

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (orderData: Record<string, unknown>) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const resBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resBody.message || 'Tạo đơn hàng thất bại');
      }
      return resBody;
    },
    onSuccess: () => {
      toast.success('Đặt hàng thành công!');
      resetCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      router.push('/order-success');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);
    },
  });

  const handleNextToReview = async () => {
    const valid = await form.trigger(['fullName', 'email', 'phone', 'address']);
    if (valid) {
      setStep('review');
    }
  };

  function handlePlaceOrder(data: CheckoutFormValues) {
    const userId = getUserId(user);
    if (!user || !userId || !token) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    const fullAddress = [data.fullName, data.phone, data.address, data.city]
      .filter(Boolean)
      .join(' - ');

    createOrder({
      shipping_address: fullAddress,
      payment_method: data.paymentMethod,
      order_items: items.map((item) => ({
        laptop_id: item.product._id,
        quantity: item.quantity,
      })),
    });
  }

  if (!isLoggedIn || !token) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-[#F5F7FF] p-10 space-y-4">
            <h1 className="text-2xl font-semibold text-black">Customer Login Required</h1>
            <p className="text-sm text-[#666666]">
              Vui lòng đăng nhập để tiếp tục quy trình thanh toán đơn hàng.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-sm px-10 h-[50px] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-[#F5F7FF] p-10 space-y-4">
            <h1 className="text-2xl font-semibold text-black">Giỏ hàng trống</h1>
            <p className="text-sm text-[#666666]">
              Bạn chưa có sản phẩm nào trong giỏ hàng để thanh toán.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-sm px-10 h-[50px] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb — Figma Checkout - 1 */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <Link href="/cart" className="hover:text-[#0156FF]">
            Shopping Cart
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">Checkout Process</span>
        </nav>

        {/* Top Row: Checkout Title + 2-Step Horizontal Stepper (Figma Group 198) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <h1 className="text-[32px] font-semibold text-black">Checkout</h1>
          </div>

          {/* 2-Step Horizontal Stepper */}
          <div className="flex items-center w-full lg:w-[388px]">
            {/* Step 1: Shipping */}
            <button
              type="button"
              onClick={() => setStep('shipping')}
              className="flex-1 flex flex-col items-center relative"
            >
              <div className="w-full flex items-center">
                <div className="flex-1 h-[2.5px] bg-[#0156FF]" />
                <div className="w-[40px] h-[40px] rounded-full border-2 border-[#0156FF] bg-white flex items-center justify-center text-black font-semibold text-sm">
                  {step === 'review' ? <Check className="w-4 h-4 text-black" /> : '1'}
                </div>
                <div
                  className={`flex-1 h-[2.5px] ${
                    step === 'review' ? 'bg-[#0156FF]' : 'bg-[#CACDD8]'
                  }`}
                />
              </div>
              <span className="mt-2 text-[14px] font-semibold text-black">Shipping</span>
            </button>

            {/* Step 2: Review & Payments */}
            <button
              type="button"
              onClick={handleNextToReview}
              className="flex-1 flex flex-col items-center relative"
            >
              <div className="w-full flex items-center">
                <div
                  className={`flex-1 h-[2.5px] ${
                    step === 'review' ? 'bg-[#0156FF]' : 'bg-[#CACDD8]'
                  }`}
                />
                <div
                  className={`w-[40px] h-[40px] rounded-full border-2 bg-white flex items-center justify-center font-semibold text-sm ${
                    step === 'review'
                      ? 'border-[#0156FF] text-black'
                      : 'border-[#CACDD8] text-[#A2A6B0]'
                  }`}
                >
                  2
                </div>
                <div className="flex-1 h-[2.5px] bg-[#CACDD8]" />
              </div>
              <span
                className={`mt-2 text-[14px] ${
                  step === 'review' ? 'font-semibold text-black' : 'text-[#A2A6B0]'
                }`}
              >
                Review &amp; Payments
              </span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout: Form (Left) + Order Summary (#F5F7FF Right) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left Column */}
          <div className="flex-1 w-full">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-6">
                {step === 'shipping' ? (
                  <>
                    <div className="border-b border-[#CACDD8] pb-3">
                      <h2 className="text-[18px] font-semibold text-black">Shipping Address</h2>
                    </div>

                    <div className="max-w-[565px] space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-semibold text-black">
                              Email Address <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <input
                                type="email"
                                {...field}
                                className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] focus:outline-none focus:border-[#0156FF]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <hr className="border-[#CACDD8]" />

                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-semibold text-black">
                              Full Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...field}
                                className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] focus:outline-none focus:border-[#0156FF]"
                              />
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
                            <FormLabel className="text-[13px] font-semibold text-black">
                              Phone Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <input
                                type="tel"
                                {...field}
                                className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] focus:outline-none focus:border-[#0156FF]"
                              />
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
                            <FormLabel className="text-[13px] font-semibold text-black">
                              Street Address <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                                {...field}
                                className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] focus:outline-none focus:border-[#0156FF]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-semibold text-black">
                              City / Province
                            </FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...field}
                                className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-4 text-[14px] focus:outline-none focus:border-[#0156FF]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <hr className="border-[#CACDD8]" />

                    {/* Shipping Rate Radio Group — Figma Checkout - 1 */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-[13px] font-semibold text-black mb-2">Standard Rate</p>
                        <label className="flex items-center justify-between gap-4 cursor-pointer">
                          <span className="flex items-center gap-3 text-[14px] text-black">
                            <input
                              type="radio"
                              checked
                              readOnly
                              className="w-5 h-5 accent-[#0156FF]"
                            />
                            <span>
                              Price may vary depending on the item/destination. Shop Staff will contact you.
                            </span>
                          </span>
                          <span className="text-[14px] font-semibold text-black">
                            {shippingCost.toLocaleString('vi-VN')} ₫
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleNextToReview}
                        className="w-[210px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  /* STEP 2: Review & Payments */
                  <>
                    <div className="border-b border-[#CACDD8] pb-3">
                      <h2 className="text-[18px] font-semibold text-black">
                        Payment Method &amp; Order Review
                      </h2>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-3 max-w-[565px]">
                      <p className="text-[13px] font-semibold text-black">
                        Select Payment Method <span className="text-red-500">*</span>
                      </p>

                      <label
                        className={`flex items-center gap-3 p-4 border rounded-[4px] cursor-pointer transition-colors ${
                          form.watch('paymentMethod') === 'cod'
                            ? 'border-[#0156FF] bg-[#F5F7FF]'
                            : 'border-[#CACDD8] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          value="cod"
                          checked={form.watch('paymentMethod') === 'cod'}
                          onChange={() => form.setValue('paymentMethod', 'cod')}
                          className="w-5 h-5 accent-[#0156FF]"
                        />
                        <div>
                          <p className="font-semibold text-[14px] text-black">
                            Cash on Delivery (COD)
                          </p>
                          <p className="text-[12px] text-[#666666]">
                            Thanh toán trực tiếp khi nhận hàng
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-4 border rounded-[4px] cursor-pointer transition-colors ${
                          form.watch('paymentMethod') === 'e-wallet'
                            ? 'border-[#0156FF] bg-[#F5F7FF]'
                            : 'border-[#CACDD8] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          value="e-wallet"
                          checked={form.watch('paymentMethod') === 'e-wallet'}
                          onChange={() => form.setValue('paymentMethod', 'e-wallet')}
                          className="w-5 h-5 accent-[#0156FF]"
                        />
                        <div>
                          <p className="font-semibold text-[14px] text-black">
                            E-Wallet / Chuyển khoản điện tử
                          </p>
                          <p className="text-[12px] text-[#666666]">
                            Thanh toán nhanh qua ví điện tử
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Shipping Address Summary Box */}
                    <div className="bg-[#F5F7FF] p-5 max-w-[565px] space-y-2 text-[14px]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-black">Ship To:</h3>
                        <button
                          type="button"
                          onClick={() => setStep('shipping')}
                          className="text-xs font-semibold text-[#0156FF] underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-black font-medium">{form.getValues('fullName')}</p>
                      <p className="text-[#666666]">{form.getValues('email')}</p>
                      <p className="text-[#666666]">{form.getValues('phone')}</p>
                      <p className="text-[#666666]">
                        {form.getValues('address')}
                        {form.getValues('city') ? `, ${form.getValues('city')}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep('shipping')}
                        disabled={isPending}
                        className="px-8 h-[50px] rounded-full border-2 border-[#A2A6B0] text-[#666666] hover:border-black hover:text-black font-semibold text-[14px] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-[210px] h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors disabled:opacity-50"
                      >
                        {isPending ? 'Đang xử lý...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </FormProvider>
          </div>

          {/* Right Column: Order Summary — Figma Group 193 (#F5F7FF, 446px) */}
          <aside className="w-full lg:w-[446px] shrink-0 bg-[#F5F7FF] p-7">
            <h2 className="text-[24px] font-semibold text-black pb-4 border-b border-[#CACDD8]">
              Order Summary
            </h2>

            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between py-4 text-[14px] text-black"
            >
              <span>{getTotalItems()} Items in Cart</span>
              {summaryOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {summaryOpen && (
              <div className="space-y-5 pb-4">
                {items.map((item) => {
                  if (!item || !item.product || !item.product.images?.mainImg) return null;
                  const linePrice = Number(item.product.price || 0) * item.quantity;
                  return (
                    <div key={item.product._id} className="flex items-start gap-4">
                      <img
                        src={item.product.images.mainImg.url}
                        alt={item.product.name}
                        className="w-[62px] h-[62px] object-contain bg-white p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-black line-clamp-2 leading-snug">
                          {item.product.title || item.product.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-[14px]">
                          <span className="text-[#A2A6B0]">Qty {item.quantity}</span>
                          <span className="font-semibold text-black">
                            {linePrice.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-[#CACDD8] pt-4 space-y-2.5 text-[13px] font-semibold text-black">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>{taxAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#CACDD8]">
                <span>Order Total</span>
                <span className="text-[18px] font-semibold">
                  {finalTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
