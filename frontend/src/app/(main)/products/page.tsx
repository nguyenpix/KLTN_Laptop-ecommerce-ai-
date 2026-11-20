'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/features/products/components/ProductCard";
import ProductFilters from "@/features/products/components/ProductFilters";
import ProductSort from "@/features/products/components/ProductSort";
import { useProducts } from "@/features/products/hook/useProducts";
import { useBrands } from "@/features/products/hook/useBrands";
import { useCategories } from "@/features/products/hook/useCategories";
import { useColors } from "@/features/products/hook/useColors";
import { usePagination, DOTS } from "@/hooks/usePagination";
import { Product } from "@/features/products/types";
import { LayoutGrid, List } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSearch = searchParams.get("search") || "";
  const urlBrand = searchParams.get("brand") || "";
  const urlTags = searchParams.get("tags") || "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Record<string, string | number>>({
    page: 1,
    limit: 20,
    category: "",
    brand: urlBrand,
    color: "",
    sort: "",
    search: urlSearch,
    tags: urlTags,
    cpu: "",
    ram: "",
    gpu: "",
    storage: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: urlSearch,
      brand: urlBrand || prev.brand,
      tags: urlTags,
      page: 1,
    }));
  }, [urlSearch, urlBrand, urlTags]);

  const { data, isLoading, error } = useProducts(filters);
  const { data: brandsData } = useBrands();
  const { data: categoriesData } = useCategories();
  const { data: colorsData } = useColors();

  const brands = brandsData?.data || [];
  const categories = categoriesData?.data || [];
  const colors = colorsData?.data || [];

  const handleFilterChange = (filterName: string, value: string | number | number[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: 1,
      [filterName]: Array.isArray(value) ? value.join(",") : value,
    }));
  };

  const handleClearAll = () => {
    setFilters({
      page: 1,
      limit: Number(filters.limit) || 20,
      category: "",
      brand: "",
      color: "",
      sort: String(filters.sort || ""),
      search: "",
      tags: "",
      cpu: "",
      ram: "",
      gpu: "",
      storage: "",
      minPrice: "",
      maxPrice: "",
    });
    if (urlSearch || urlBrand || urlTags) {
      router.push("/products");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (typeof newPage !== "number") return;
    setFilters((prevFilters) => ({ ...prevFilters, page: newPage }));
  };

  const currentPage = data?.page || 1;
  const totalCount = data?.total || 0;
  const pageSize = data?.limit || 20;
  const totalPages = data?.totalPages || 1;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount: 1,
    pageSize,
  });

  const products: Product[] = data?.data || [];
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Build active filter chips (Figma Component 44)
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (filters.search) {
    activeChips.push({
      key: "search",
      label: `Search: "${filters.search}"`,
      onRemove: () => {
        handleFilterChange("search", "");
        router.push("/products");
      },
    });
  }
  if (filters.category) {
    const catName = categories.find((c: { _id: string; name: string }) => c._id === filters.category)?.name || "Category";
    activeChips.push({
      key: "category",
      label: catName,
      onRemove: () => handleFilterChange("category", ""),
    });
  }
  if (filters.brand) {
    const brandName = brands.find((b: { _id: string; name: string }) => b._id === filters.brand)?.name || "Brand";
    activeChips.push({
      key: "brand",
      label: brandName,
      onRemove: () => handleFilterChange("brand", ""),
    });
  }
  if (filters.color) {
    const colorName = colors.find((c: { _id: string; name: string }) => c._id === filters.color)?.name || "Color";
    activeChips.push({
      key: "color",
      label: colorName,
      onRemove: () => handleFilterChange("color", ""),
    });
  }
  if (filters.cpu) {
    activeChips.push({
      key: "cpu",
      label: `CPU: ${filters.cpu}`,
      onRemove: () => handleFilterChange("cpu", ""),
    });
  }
  if (filters.ram) {
    activeChips.push({
      key: "ram",
      label: `RAM: ${filters.ram}`,
      onRemove: () => handleFilterChange("ram", ""),
    });
  }
  if (filters.gpu) {
    activeChips.push({
      key: "gpu",
      label: `GPU: ${filters.gpu}`,
      onRemove: () => handleFilterChange("gpu", ""),
    });
  }
  if (filters.storage) {
    activeChips.push({
      key: "storage",
      label: `SSD: ${filters.storage}`,
      onRemove: () => handleFilterChange("storage", ""),
    });
  }
  if (filters.minPrice !== "" || filters.maxPrice !== "") {
    activeChips.push({
      key: "price",
      label: `${Number(filters.minPrice || 0).toLocaleString("vi-VN")}₫ - ${Number(filters.maxPrice || 0).toLocaleString("vi-VN")}₫`,
      onRemove: () => {
        handleFilterChange("minPrice", "");
        handleFilterChange("maxPrice", "");
      },
    });
  }

  const activeBrandName = filters.brand
    ? brands.find((b: { _id: string; name: string }) => b._id === filters.brand)?.name
    : null;

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pb-16">
        {/* Top Promotional Banner (Figma Group 56 - 1398x104) */}
        <div className="w-full h-[104px] bg-black relative overflow-hidden mb-5 flex items-center justify-between px-8 md:px-16">
          <img
            src="/assets/image/banner1.jpg"
            alt="Catalog Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 flex items-center justify-between w-full">
            <div>
              <p className="text-white text-lg md:text-2xl font-extrabold tracking-wide uppercase">
                ASUS TUF &amp; MSI GAMING SERIES
              </p>
              <p className="text-amber-400 text-xs md:text-sm font-semibold uppercase">
                High Performance At An Affordable Price
              </p>
            </div>
            <span className="hidden sm:inline-block border border-white text-white text-xs font-semibold px-4 py-1.5 uppercase">
              Shop Now
            </span>
          </div>
        </div>

        {/* Breadcrumb (Figma Home › Laptops › ...) */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#0156FF]">Home</Link>
          <span className="text-[#0156FF]">›</span>
          <Link href="/products" className="hover:text-[#0156FF]">Laptops</Link>
          {activeBrandName && (
            <>
              <span className="text-[#0156FF]">›</span>
              <span className="text-[#A2A6B0]">{activeBrandName} Series</span>
            </>
          )}
        </nav>

        {/* Page Title */}
        <h1 className="text-[32px] font-semibold text-black mb-4">
          {filters.search
            ? `Search: "${filters.search}" (${totalCount})`
            : activeBrandName
              ? `${activeBrandName} Series (${totalCount})`
              : `Laptops (${totalCount})`}
        </h1>

        {/* Top Control Row: ‹ Back (left 234px) + Toolbar (right flex-1) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full lg:w-[234px] h-[50px] flex items-center justify-center font-semibold text-[14px] text-black hover:text-[#0156FF] shrink-0"
          >
            ‹ Back
          </button>

          <div className="flex-1 flex flex-wrap items-center justify-between gap-3 min-h-[50px]">
            <p className="text-[13px] text-[#A2A6B0]">
              Items {startItem}-{endItem} of {totalCount}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ProductSort
                onSortChange={handleFilterChange}
                sortValue={String(filters.sort || "")}
                limitValue={Number(filters.limit) || 20}
              />

              {/* Grid / List View Toggle (Figma Component 43) */}
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${
                    viewMode === "grid" ? "text-black" : "text-[#A2A6B0] hover:text-black"
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${
                    viewMode === "list" ? "text-black" : "text-[#A2A6B0] hover:text-black"
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar (234px) + Products Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-[234px] shrink-0">
            <ProductFilters
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              activeFilters={filters}
            />
          </aside>

          {/* Right Product Area */}
          <section className="flex-1 w-full">
            {/* Active Filter Chips Bar (Figma Component 44) */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeChips.map((chip) => (
                  <div
                    key={chip.key}
                    className="inline-flex items-center gap-2 border border-[#CACDD8] bg-white px-4 h-[38px] text-[13px] font-semibold text-black"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="w-4 h-4 rounded-full bg-[#C94D3F] text-white text-[10px] flex items-center justify-center leading-none hover:bg-red-700"
                      aria-label={`Remove ${chip.label}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="border border-[#CACDD8] bg-white px-4 h-[38px] text-[13px] font-semibold text-black hover:border-black"
                >
                  Clear All
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">
                Có lỗi xảy ra: {(error as Error).message}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#F5F7FF]">
                <p className="text-black text-base mb-4">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-6 py-2 rounded-full border-2 border-[#0156FF] text-[#0156FF] font-semibold text-sm hover:bg-[#0156FF] hover:text-white transition-colors"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  /* 5-Column Grid on XL matching Figma Catalog - 1 */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        layout="grid"
                      />
                    ))}
                  </div>
                ) : (
                  /* List View matching Figma Catalog - List view - 1 */
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        layout="list"
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50 rounded-full"
                              : "cursor-pointer rounded-full"
                          }
                        />
                      </PaginationItem>
                      {paginationRange?.map((pageNumber, index) => {
                        if (pageNumber === DOTS) {
                          return (
                            <PaginationItem key={index}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNumber as number)}
                              isActive={pageNumber === currentPage}
                              className="cursor-pointer rounded-full"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-50 rounded-full"
                              : "cursor-pointer rounded-full"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}

                {/* Bottom SEO Description Block (Figma Catalog - 1) */}
                <div className="mt-14 max-w-4xl mx-auto text-center space-y-4">
                  <p className="text-[12px] text-[#8C8C8C] leading-relaxed text-left">
                    MSI &amp; ASUS have unveiled the latest line of business-class, creator, and gaming notebooks. Tuned for color accuracy and peak performance, these laptops leverage cutting-edge processors, dedicated graphics, and high-refresh displays to best fit your computing needs—from 3D rendering and software engineering to esports gaming and everyday productivity.
                  </p>
                  <button
                    type="button"
                    className="px-7 py-1.5 rounded-full border-2 border-[#A2A6B0] text-[#A2A6B0] text-[14px] font-semibold hover:border-black hover:text-black transition-colors"
                  >
                    More
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-20 text-center">Đang tải danh sách sản phẩm...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
