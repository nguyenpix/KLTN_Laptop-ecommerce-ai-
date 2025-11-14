'use client';

import React, { useState } from 'react';
import { useProducts } from '@/features/products/hooks/useProducts';
import ProductTable from '@/features/products/components/ProductTable';
import { CreateProductDialog } from '@/features/products/components/CreateProductDialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Pagination } from '@/shared/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [sortFilter, setSortFilter] = useState<string>('newest');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data, isLoading, isError } = useProducts({
    page,
    limit: 10,
    search: searchQuery,
    ...(minPriceFilter && { minPrice: parseFloat(minPriceFilter) }),
    ...(maxPriceFilter && { maxPrice: parseFloat(maxPriceFilter) }),
    sort: sortFilter,
  });

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý sản phẩm</CardTitle>
          <CardDescription>
            Quản lý danh sách sản phẩm trong cửa hàng.
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8 w-full"
            />
          </div>
          <Button onClick={handleSearch}>Tìm kiếm</Button>

          <Input
            type="number"
            placeholder="Giá từ..."
            value={minPriceFilter}
            onChange={(e) => setMinPriceFilter(e.target.value)}
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Giá đến..."
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value)}
            className="w-[120px]"
          />

          <Select value={sortFilter} onValueChange={setSortFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="price_asc">Giá tăng dần</SelectItem>
              <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              <SelectItem value="name_asc">Tên A-Z</SelectItem>
              <SelectItem value="name_desc">Tên Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && <p className="text-center text-muted-foreground py-8">Đang tải...</p>}
        {isError && <p className="text-center text-red-500 py-8">Lỗi khi tải dữ liệu sản phẩm.</p>}
        
        {data && (
          <>
            <ProductTable products={data.data} />
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        <CreateProductDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </CardContent>
    </Card>
  );
}
