"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import AccountSidebar from "@/shared/components/layout/AccountSidebar";
import ProductCard from "@/features/products/components/ProductCard";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, loadWishlistFromServer, isLoading } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    loadWishlistFromServer();
  }, [loadWishlistFromServer]);

  const validItems = items.filter(
    (item) => item && item.product_id && item.product_id._id
  );

  const handleAddAllToCart = async () => {
    for (const item of validItems) {
      await addToCart(item.product_id, 1);
    }
    toast.success("Đã thêm tất cả sản phẩm yêu thích vào giỏ hàng!");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <Link href="/profile" className="hover:text-[#0156FF]">
            My Dashboard
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">My Wish List</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <h1 className="text-[32px] font-semibold text-black">
            My Wish List ({validItems.length})
          </h1>

          {validItems.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="h-[40px] px-7 rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors"
            >
              Add All to Cart
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Figma Dashboard Sidebar */}
          <AccountSidebar activeSection="wishlist" />

          {/* Right Content: Wish List Grid using Figma ProductCard */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="py-16 text-center text-[14px] text-[#A2A6B0]">
                Đang tải danh sách yêu thích...
              </div>
            ) : validItems.length === 0 ? (
              <div className="bg-[#F5F7FF] p-12 text-center">
                <p className="text-[16px] text-black font-medium mb-2">
                  You have no items in your wish list.
                </p>
                <p className="text-[13px] text-[#A2A6B0] mb-6">
                  Hãy nhấn vào biểu tượng trái tim trên sản phẩm để lưu laptop yêu thích của bạn.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-[40px] px-8 rounded-[50px] bg-[#0156FF] hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div>
                <div className="border-b border-[#CACDD8] pb-3 mb-4 flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-black">
                    Saved Items ({validItems.length})
                  </h2>
                  <Link
                    href="/products"
                    className="text-[13px] text-[#0156FF] underline hover:opacity-80"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                  {validItems.map((item) => (
                    <div key={item._id} className="w-full">
                      <ProductCard product={item.product_id} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
