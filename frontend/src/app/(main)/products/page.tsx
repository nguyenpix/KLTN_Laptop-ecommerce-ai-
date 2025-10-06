'use client';

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/features/products/components/ProductCard";
import ProductFilters from "@/features/products/components/ProductFilters";
import ProductSort from "@/features/products/components/ProductSort";
import { useProducts } from "@/features/products/hook/useProducts";
import { usePagination, DOTS } from "@/hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// (Product interface remains the same)
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

export default function ProductPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: "",
    brand: "",
    color: "",
    sort: "",
  });

  const { data, isLoading, error } = useProducts(filters);

  const handleFilterChange = (filterName: string, value: string | number | number[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: 1, // Reset to first page on filter change
      [filterName]: value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (typeof newPage !== 'number') return;
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

  return (
    <main className="container py-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar for Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="space-y-6">
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
        </aside>

        {/* Main Content */}
        <section className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Hiển thị {products.length} trên {totalCount} sản phẩm
            </p>
            <ProductSort onSortChange={handleFilterChange} />
          </div>

          {isLoading ? (
            <div className="text-center py-10">⏳ Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              ❌ Có lỗi xảy ra: {(error as Error).message}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>

              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {paginationRange?.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                      return <PaginationItem key={index}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber as number)}
                          isActive={pageNumber === currentPage}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
