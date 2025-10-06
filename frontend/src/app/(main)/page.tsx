// src/app/(main)/page.tsx
"use client";
import HomeBanner from "@/features/products/components/HomeBanner";
import ProductCard from "@/features/products/components/ProductCard";
import { useProducts } from "@/features/products/hook/useProducts";
import Link from "next/link";
import { useEffect, useState } from "react";
export interface Product {
  id: number;
  title: string;
  name: string;
  description?: string;
  price: number;
  priceDiscount?: number;
  images: {
    mainImg: {
      url: string;
      alt_text: string;
    };
    sliderImg: Array<{
      url: string;
      alt_text: string;
    }>;
  };
  reviews?: number;
}

export default function HomePage() {
  // ✅ Đặt bộ lọc ở đây
  const filters = { tags: "New", limit: 5 };

  const { data, isLoading, error } = useProducts(filters);

  if (isLoading) {
    return <div className="text-center py-10">⏳ Đang tải sản phẩm...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        ❌ Có lỗi xảy ra: {(error as Error).message}
      </div>
    );
  }

  const products: Product[] = data?.data || [];
  return (
    <main>
      {/* 1. Banner quảng cáo */}
      <HomeBanner />

      {/* 2. Phần sản phẩm mới */}
      <section className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
      </section>
    </main>
  );
}
