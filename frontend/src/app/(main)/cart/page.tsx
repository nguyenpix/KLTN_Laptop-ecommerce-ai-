'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const [discountCode, setDiscountCode] = useState('');

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1; // Ensure quantity is at least 1
    updateQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Giỏ hàng của bạn đã được xóa.');
    router.push('/products');
  };

  const handleApplyDiscount = () => {
    toast.info('Chức năng mã giảm giá đang được phát triển.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg py-12">
          <p className="mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link href="/products">
            <Button className="rounded-full">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border pb-4 mb-4 font-semibold">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-border rounded-lg p-4 items-center">
                  {/* Item (Image + Name + Actions) */}
                  <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.product.images.mainImg.url}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className="font-medium line-clamp-2 mb-2">{item.product.name}</h2>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-destructive hover:text-destructive/90 p-0 h-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-4 md:col-span-2 text-center">
                    <span className="md:hidden font-semibold mr-2">Price:</span>
                    {item.product.price.toLocaleString('vi-VN')}đ
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 md:col-span-2 flex justify-center items-center gap-2">
                    <span className="md:hidden font-semibold mr-2">Qty:</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))}
                      className="w-16 text-center h-8"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-4 md:col-span-2 text-right font-bold">
                    <span className="md:hidden font-semibold mr-2">Subtotal:</span>
                    {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="outline" className="rounded-full">Continue Shopping</Button>
              </Link>
              <Button 
                variant="outline" 
                className="rounded-full" 
                onClick={handleClearCart}
              >
                Clear Shopping Cart
              </Button>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Summary</h2>
              
              {/* Estimate Shipping and Tax */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Estimate Shipping and Tax</h3>
                <p className="text-sm text-muted-foreground mb-2">Enter your destination to get a shipping estimate.</p>
                <div className="space-y-3">
                  <select className="w-full border border-border rounded-md px-3 py-2 text-sm">
                    <option>Select Country</option>
                    <option>Vietnam</option>
                  </select>
                  <select className="w-full border border-border rounded-md px-3 py-2 text-sm">
                    <option>State/Province</option>
                  </select>
                  <Input placeholder="Zip/Postal Code" className="text-sm" />
                </div>
              </div>

              {/* Apply Discount Code */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Apply Discount Code</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter discount code" 
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyDiscount}
                    className="rounded-full"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{getTotalPrice().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span className="font-semibold">0đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span>Order Total</span>
                  <span className="text-orange-600">{getTotalPrice().toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="mt-6 space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-base font-semibold">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full rounded-full py-6"
                  onClick={() => toast.info('PayPal integration coming soon')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.637h8.89c2.754 0 4.63.675 5.58 2.006.896 1.256.99 2.909.272 4.782-.743 1.937-1.99 3.355-3.606 4.105-1.447.673-3.264.989-5.409.989h-1.483a.77.77 0 0 0-.761.637l-.792 4.994a.641.641 0 0 1-.633.74z"/>
                  </svg>
                  Check out with PayPal
                </Button>
                <Button 
                  variant="link" 
                  className="w-full text-blue-600 hover:text-blue-700"
                  onClick={() => toast.info('Multiple addresses feature coming soon')}
                >
                  Check Out with Multiple Addresses
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}