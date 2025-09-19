// src/app/(main)/page.tsx
import HomeBanner from "@/features/products/components/HomeBanner";
import ProductList from "@/features/products/components/ProductList";

export default function HomePage() {
  return (
    <main>
      {/* 1. Banner quảng cáo */}
      <HomeBanner />

      {/* 2. Phần sản phẩm mới */}
      <section className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
          <a href="/products" className="text-sm text-blue-600 hover:underline">
            Xem tất cả
          </a>
        </div>
        <ProductList />
      </section>

    </main>
  );
}