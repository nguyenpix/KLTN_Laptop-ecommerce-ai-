'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart, updateCartOnServer, isCartDirty, setIsCartDirty } = useCartStore();

  const [initialItems, setInitialItems] = useState(items);

  useEffect(() => {
    setInitialItems(items);
  }, []);

  useEffect(() => {
    const hasChanged = JSON.stringify(items) !== JSON.stringify(initialItems);
    setIsCartDirty(hasChanged);
  }, [items, initialItems, setIsCartDirty]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1; // Ensure quantity is at least 1
    updateQuantity(productId, newQuantity);
  };

  const handleUpdateCart = async () => {
    try {
      await updateCartOnServer(items);
      setInitialItems(items); // Reset initial items after successful update
      setIsCartDirty(false);
      toast.success('Giỏ hàng đã được cập nhật thành công!');
    } catch (error) {
      toast.error('Cập nhật giỏ hàng thất bại. Vui lòng thử lại.');
      console.error('Failed to update cart:', error);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Giỏ hàng của bạn đã được xóa.');
    router.push('/products');
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">
          <p className="mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link href="/products">
            <Button>Tiếp tục mua sắm</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.product._id} className="flex items-center border border-border rounded-lg p-4 shadow-sm">
                <div className="relative w-24 h-24 flex-shrink-0 mr-4">
                  <Image
                    src={item.product.images.mainImg.url}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold line-clamp-2 mb-1">{item.product.name}</h2>
                  <p className="text-muted-foreground text-sm mb-2">Giá: {item.product.price.toLocaleString('vi-VN')}đ</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="text-right font-bold text-lg">
                  {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
            <div className="mt-6 flex flex-col space-y-4">
              <Link href="/products">
                <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
              </Link>
              <Button variant="destructive" className="w-full" onClick={handleClearCart}>Xóa giỏ hàng</Button>
              <Button
                className="w-full"
                disabled={!isCartDirty} // Disable if no changes
                onClick={handleUpdateCart}
              >
                Cập nhật giỏ hàng
              </Button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1 bg-muted p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-2xl font-bold mb-6">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between text-lg mb-3">
              <span>Tổng phụ:</span>
              <span>{getTotalPrice().toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-lg mb-6 border-b border-border pb-6">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span> {/* Placeholder */}
            </div>
            <div className="flex justify-between text-2xl font-bold mb-8">
              <span>Tổng cộng:</span>
              <span>{getTotalPrice().toLocaleString('vi-VN')}đ</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
                Tiến hành thanh toán
              </Button>
            </Link>

          </div>
        </div>
      )}
    </div>
  );
}