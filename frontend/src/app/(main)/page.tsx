// src/app/(main)/page.tsx
"use client";

import React, { useState } from "react";
import HomeBanner from "@/features/products/components/HomeBanner";
import ProductCard from "@/features/products/components/ProductCard";
import { useProducts } from "@/features/products/hook/useProducts";
import { useBrands } from "@/features/products/hook/useBrands";
import { useCategories } from "@/features/products/hook/useCategories";
import { Product } from "@/features/products/types";
import { RecommendationsList } from "@/features/recommendations";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: brandsData } = useBrands();
  const { data: categoriesData } = useCategories();
  const brands: Array<{ _id: string; name: string }> = brandsData?.data || [];
  const categories: Array<{ _id: string; name: string }> =
    categoriesData?.data || [];

  // Tìm brand_id từ tên brand trong Database
  const getBrandId = (brandName: string) => {
    const brand = brands.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase()
    );
    return brand?._id || "";
  };

  const { data: newProducts, isLoading: loadingNew } = useProducts({
    tags: "New",
    limit: 6,
  });

  if (loadingNew && !brands.length) {
    return (
      <div className="text-center py-14 text-[14px] text-[#A2A6B0]">
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Banner quảng cáo */}
      <HomeBanner />

      <div className="container mx-auto px-4 py-9 space-y-10 max-w-[1400px]">
        {/* New Products (6 columns - Figma Home - 1) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[22px] font-semibold text-black">
              New Products
            </h2>
            <Link
              href="/products?tags=New"
              className="text-[13px] text-[#0156FF] underline hover:opacity-80"
            >
              See All New Products
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {(newProducts?.data || []).map((product: Product) => (
              <div key={product._id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Zip Banner - Figma Home - 1 (Node 121:2362, 1398x70, #F5F7FF) */}
        <div className="bg-[#F5F7FF] min-h-[70px] py-4 px-6 flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="inline-flex items-center font-extrabold text-[18px] text-[#272560] tracking-tight bg-white px-3 py-0.5 rounded border border-[#CACDD8]">
            zip
          </span>
          <span className="text-[#0156FF] font-light text-[20px]">|</span>
          <p className="text-[14px] text-[#272560]">
            <span className="font-semibold">own</span> it now, up to 6 months
            interest free{" "}
            <Link
              href="/products"
              className="underline font-normal hover:text-[#0156FF]"
            >
              learn more
            </Link>
          </p>
        </div>

        {/* AI Personalized Recommendations */}
        <section className="bg-[#F5F7FF] p-6">
          <RecommendationsList
            limit={6}
            title="Gợi ý dành riêng cho bạn (AI Recommendations)"
            showMetadata={false}
          />
        </section>

        {/* Dynamic Brand Sections with Database Category Tabs (Figma Group 68 + Component 6..11) */}
        <BrandProductSection
          title="MSI Laptops"
          brandId={getBrandId("Msi")}
          categories={categories}
          bannerImage="/assets/image/msi.png"
        />

        <BrandProductSection
          title="Acer Laptops"
          brandId={getBrandId("Acer")}
          categories={categories}
          bannerImage="/assets/image/acer.jpg"
        />

        <BrandProductSection
          title="Dell Laptops"
          brandId={getBrandId("Dell")}
          categories={categories}
          bannerImage="/assets/image/dell.jpg"
        />

        <BrandProductSection
          title="Lenovo Laptops"
          brandId={getBrandId("Lenovo")}
          categories={categories}
          bannerImage="/assets/image/lenovo.jpg"
        />

        {/* Brand Logos Strip - Figma Frame 22..34 (clickable to filter by Database Brand ID) */}
        <section className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 items-center">
            {[
              { name: "Lenovo", logo: "/assets/image/logo_lenovo.png" },
              { name: "Msi", logo: "/assets/image/logo msi.png" },
              { name: "Dell", logo: "/assets/image/logo dell.png" },
              { name: "Acer", logo: "/assets/image/logo_acer.png" },
            ].map((b) => {
              const bId = getBrandId(b.name);
              return (
                <Link
                  key={b.name}
                  href={bId ? `/products?brand=${bId}` : "/products"}
                  className="w-full h-[149px] flex items-center justify-center p-6 bg-white hover:bg-[#F5F7FF] transition-colors grayscale hover:grayscale-0 opacity-80 hover:opacity-100"
                >
                  <Image
                    src={b.logo}
                    alt={b.name}
                    width={152}
                    height={80}
                    className="object-contain max-h-[75px]"
                  />
                </Link>
              );
            })}
            {brands
              .filter(
                (b) =>
                  !["lenovo", "msi", "dell", "acer"].includes(
                    b.name.toLowerCase()
                  )
              )
              .slice(0, 3)
              .map((b) => (
                <Link
                  key={b._id}
                  href={`/products?brand=${b._id}`}
                  className="w-full h-[149px] flex items-center justify-center p-6 bg-white hover:bg-[#F5F7FF] transition-colors text-[22px] font-extrabold text-[#A2A6B0] hover:text-black uppercase tracking-wider"
                >
                  {b.name}
                </Link>
              ))}
          </div>
        </section>

        {/* Instagram / News Section - Figma Frame 35..43 */}
        <section className="py-2">
          <h2 className="text-[22px] font-semibold text-black mb-5">
            Follow us on Instagram for News, Offers &amp; More
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col text-center">
                <div className="relative h-[151px] w-full overflow-hidden mb-2.5">
                  <Image
                    src={`/assets/image/banner${(item % 4) + 1}.jpg`}
                    alt={`Instagram post ${item}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-[12px] text-black leading-[18px] px-2 line-clamp-4">
                  If you&apos;ve recently made a desktop PC or laptop purchase,
                  you might want to consider adding peripherals to enhance your
                  home office setup, your gaming rig, or your business
                  workspace...
                </p>
                <span className="text-[10px] text-[#A2A6B0] mt-2">
                  01.09.2026
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial Section - Figma Group 62 (1160px, #F5F7FF) */}
        <section className="py-6">
          <div className="max-w-[1160px] mx-auto bg-[#F5F7FF] px-8 md:px-[119px] py-[45px]">
            <div className="flex items-start gap-6">
              <span className="text-[64px] leading-none font-serif text-black select-none">
                &lsquo;&rsquo;
              </span>
              <div className="flex-1">
                <blockquote className="text-[18px] text-black leading-[27px] mb-3">
                  My first order arrived today in perfect condition. From the
                  time I sent a question about the item to making the purchase,
                  to the shipping and now the delivery, your company, Tecs, has
                  stayed in touch. Such great customer service. I look forward
                  to shopping on your site in the future and would highly
                  recommend it.
                </blockquote>
                <div className="text-[14px] text-black text-right">
                  - Tama Brown
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-[37px] px-[26px] border-2 border-[#0156FF] text-[#0156FF] text-[14px] font-semibold rounded-[50px] hover:bg-[#0156FF] hover:text-white transition-colors"
              >
                Leave Us A Review
              </Link>
              <div className="flex items-center gap-2.5">
                {[1, 2, 3, 4].map((dot) => (
                  <button
                    key={dot}
                    className={`w-3 h-3 rounded-full ${
                      dot === 1 ? "bg-[#0156FF]" : "bg-[#CACDD8]"
                    }`}
                    aria-label={`Go to testimonial ${dot}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface BrandProductSectionProps {
  title: string;
  brandId: string;
  categories: Array<{ _id: string; name: string }>;
  bannerImage: string;
}

function BrandProductSection({
  title,
  brandId,
  categories,
  bannerImage,
}: BrandProductSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: productsData } = useProducts({
    brand: brandId,
    ...(selectedCategoryId ? { category: selectedCategoryId } : {}),
    limit: 5,
  });

  // Fallback to all products of that brand if the selected category tab has 0 products for this brand
  const { data: fallbackData } = useProducts({
    brand: brandId,
    limit: 5,
  });

  const products: Product[] =
    productsData?.data && productsData.data.length > 0
      ? productsData.data
      : fallbackData?.data || [];

  const brandShort = title.replace(" Laptops", "");

  return (
    <section>
      {/* Figma Group 68: Series / Category Tabs above each Brand Row */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-6 mb-4">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("")}
            className={`text-[16px] font-semibold pb-1 transition-colors ${
              selectedCategoryId === ""
                ? "text-black border-b-2 border-[#0156FF]"
                : "text-[#838383] hover:text-black"
            }`}
          >
            {brandShort} All Series
          </button>
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`text-[16px] font-semibold pb-1 transition-colors ${
                selectedCategoryId === cat._id
                  ? "text-black border-b-2 border-[#0156FF]"
                  : "text-[#838383] hover:text-black"
              }`}
            >
              {brandShort} {cat.name} Series
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Brand Banner Image - Left Side (233x346 in Figma Component 6..11) */}
        <div className="w-full lg:w-[233px] h-[220px] lg:h-[346px] flex-shrink-0 relative overflow-hidden bg-black">
          <Image
            src={bannerImage}
            alt={`${title} Banner`}
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-center text-white">
            <div className="mt-auto mb-auto">
              <h3 className="text-[22px] font-bold leading-[28px] drop-shadow">
                {title}
              </h3>
            </div>
            <Link
              href={
                brandId
                  ? `/products?brand=${brandId}${
                      selectedCategoryId ? `&category=${selectedCategoryId}` : ""
                    }`
                  : "/products"
              }
              className="text-[13px] text-white underline hover:text-[#0156FF] transition-colors"
            >
              See All Products
            </Link>
          </div>
        </div>

        {/* 5 Product Cards Grid - Right Side */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 5).map((product: Product) => (
            <div key={product._id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
