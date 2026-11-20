'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart, loadCartFromServer } =
    useCartStore();

  const [shippingOpen, setShippingOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (!Number.isFinite(newQuantity) || newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleClearCart = async () => {
    await clearCart();
    toast.info('Giỏ hàng của bạn đã được xóa.');
  };

  const handleUpdateCart = async () => {
    await loadCartFromServer();
    toast.success('Đã cập nhật giỏ hàng.');
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Chức năng mã giảm giá đang được phát triển.');
  };

  const subtotal = getTotalPrice();
  const shippingFee = subtotal > 0 ? 100000 : 0;
  const taxAmount = Math.round(subtotal * 0.08);
  const orderTotal = subtotal + shippingFee + taxAmount;

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb — Figma Shopping Cart - 1 */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-black">Shopping Cart</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[#F5F7FF]">
            <p className="text-black text-base mb-5">Giỏ hàng của bạn đang trống.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-sm px-8 h-[50px] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Table (Figma Shopping Cart - 1) */}
            <div className="flex-1 w-full">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-[#CACDD8] pb-3.5 text-[14px] font-semibold text-black">
                <div className="col-span-6">Item</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2 flex justify-between">
                  <span>Subtotal</span>
                  <span className="sr-only">Actions</span>
                </div>
              </div>

              {/* Cart Item Rows */}
              <div className="divide-y divide-[#CACDD8]">
                {items.map((item) => {
                  if (!item || !item.product || !item.product.images?.mainImg) {
                    return null;
                  }
                  const unitPrice = Number(item.product.price || 0);
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.product._id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 items-center"
                    >
                      {/* Item Image (120x120) + Description */}
                      <div className="md:col-span-6 flex items-start gap-6">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="relative w-[120px] h-[120px] shrink-0 bg-white block"
                        >
                          <Image
                            src={item.product.images.mainImg.url}
                            alt={item.product.name}
                            fill
                            className="object-contain"
                          />
                        </Link>
                        <Link
                          href={`/products/${item.product._id}`}
                          className="text-[14px] text-black hover:text-[#0156FF] leading-relaxed line-clamp-4 pt-1"
                        >
                          {item.product.title || item.product.name}
                        </Link>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-[16px] font-semibold text-black">
                        <span className="md:hidden text-xs text-[#A2A6B0] mr-2">Price:</span>
                        {unitPrice.toLocaleString('vi-VN')} ₫
                      </div>

                      {/* Qty Box — Figma Group 148 (#F5F7FF 70x50 with stacked chevrons) */}
                      <div className="md:col-span-2">
                        <div className="inline-flex items-center justify-between bg-[#F5F7FF] rounded-[6px] w-[70px] h-[50px] px-3">
                          <span className="font-semibold text-[14px] text-black select-none">
                            {item.quantity}
                          </span>
                          <div className="flex flex-col items-center justify-center -mr-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.product._id, item.quantity + 1)
                              }
                              className="text-[#A2A6B0] hover:text-black p-0.5"
                              aria-label="Increase quantity"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(item.product._id, item.quantity - 1)
                              }
                              className="text-[#A2A6B0] hover:text-black p-0.5"
                              aria-label="Decrease quantity"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal + Stacked Circular Action Icons (Remove × & Edit ✎) */}
                      <div className="md:col-span-2 flex items-center justify-between gap-2">
                        <span className="text-[16px] font-semibold text-black">
                          {lineTotal.toLocaleString('vi-VN')} ₫
                        </span>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product._id)}
                            className="w-[27px] h-[27px] rounded-full border-2 border-[#CACDD8] text-[#A2A6B0] hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-colors"
                            aria-label="Remove item"
                            title="Xóa sản phẩm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/products/${item.product._id}`}
                            className="w-[27px] h-[27px] rounded-full border-2 border-[#CACDD8] text-[#A2A6B0] hover:border-[#0156FF] hover:text-[#0156FF] flex items-center justify-center transition-colors"
                            aria-label="View item"
                            title="Xem chi tiết"
                          >
                            <Pencil className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Buttons Row — Figma Frame 101, 102, 103 */}
              <div className="border-t border-[#CACDD8] pt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] hover:border-black hover:text-black font-semibold text-[14px] px-7 h-[37px] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="inline-flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white font-semibold text-[14px] px-7 h-[37px] transition-colors"
                  >
                    Clear Shopping Cart
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateCart}
                  className="inline-flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white font-semibold text-[14px] px-7 h-[37px] transition-colors"
                >
                  Update Shopping Cart
                </button>
              </div>
            </div>

            {/* Right Column: Summary Panel — Figma Rectangle 18 (#F5F7FF, 446px) */}
            <aside className="w-full lg:w-[446px] shrink-0 bg-[#F5F7FF] p-7">
              <h2 className="text-[24px] font-semibold text-black mb-5">Summary</h2>

              {/* Accordion 1: Estimate Shipping and Tax */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShippingOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-[18px] font-normal text-black py-1"
                >
                  <span>Estimate Shipping and Tax</span>
                  {shippingOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <p className="text-[14px] text-[#666666] mt-1">
                  Enter your destination to get a shipping estimate.
                </p>

                {shippingOpen && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-1">
                        Country
                      </label>
                      <select className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-3 text-[14px]">
                        <option>Vietnam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        placeholder="TP. Hồ Chí Minh / Hà Nội"
                        className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-3 text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-1">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="700000"
                        className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-3 text-[14px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Apply Discount Code */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setDiscountOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-[18px] font-normal text-black py-1"
                >
                  <span>Apply Discount Code</span>
                  {discountOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {discountOpen && (
                  <form onSubmit={handleApplyDiscount} className="mt-3 space-y-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-1">
                        Enter discount code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="w-full h-[50px] bg-white border border-[#A2A6B0] rounded-[4px] px-3 text-[14px]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-[50px] rounded-full border-2 border-[#0156FF] text-[#0156FF] hover:bg-[#0156FF] hover:text-white font-semibold text-[14px] transition-colors"
                    >
                      Apply Discount
                    </button>
                  </form>
                )}
              </div>

              <hr className="border-[#CACDD8] my-4" />

              {/* Totals Breakdown */}
              <div className="space-y-3 text-[13px] font-semibold text-black">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingFee.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <p className="text-[10px] font-normal text-[#A2A6B0] mt-1 leading-relaxed pr-10">
                    (Standard Rate - Price may vary depending on the item/destination. TECS Staff will contact you.)
                  </p>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{taxAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span>Order Total</span>
                  <span className="text-[18px] font-semibold">
                    {orderTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* 3 Stacked Checkout Pill Buttons — Figma Group 183, Frame 35, Group 184 */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full h-[50px] rounded-full bg-[#0156FF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors"
                >
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => toast.info('PayPal integration coming soon')}
                  className="w-full h-[50px] rounded-full bg-[#FFB800] hover:bg-[#e6a600] text-[#232C65] font-semibold text-[14px] flex items-center justify-center gap-3 transition-colors"
                >
                  <span>Check out with</span>
                  <img src="/assets/icon/paypal.svg" alt="PayPal" className="h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => toast.info('Multiple addresses feature coming soon')}
                  className="w-full h-[50px] rounded-full border-2 border-[#A2A6B0] text-[#666666] hover:border-black hover:text-black font-semibold text-[14px] transition-colors"
                >
                  Check Out with Multiple Addresses
                </button>
              </div>

              {/* Zip Installment Note — Figma Group 13 */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#272560]">
                <span className="font-extrabold tracking-tight text-sm bg-white px-2 py-0.5 rounded border border-[#CACDD8]">
                  zip
                </span>
                <span className="text-[#00AEB8]">|</span>
                <span>
                  <strong>own</strong> it now, up to 6 months interest free{' '}
                  <span className="underline cursor-pointer">learn more</span>
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
