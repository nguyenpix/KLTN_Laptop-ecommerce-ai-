'use client';

import React, { useState } from 'react';
import { Product } from '@/shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteProduct } from '../hooks/useProducts';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteProduct = useDeleteProduct();
  const router = useRouter();

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleRowClick = (productId: string, e: React.MouseEvent) => {
    
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    router.push(`/dashboard/products/${productId}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Hình ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow 
                  key={product._id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={(e) => handleRowClick(product._id, e)}
                >
                  <TableCell>
                    {product.images?.mainImg?.url ? (
                      <div className="relative w-16 h-16">
                        <Image
                          src={product.images.mainImg.url}
                          alt={product.title || 'Product image'}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    {typeof product.brand_id === 'object' ? product.brand_id.name : '-'}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {product.price?.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell>
                    <span className={`${product.stock < 10 ? 'text-red-500' : ''}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(product._id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </>
  );
};

export default ProductTable;
