'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function WishlistPage() {
  const router = useRouter();
  const { items, loadWishlistFromServer, toggleWishlist, isLoading } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    loadWishlistFromServer();
  }, [loadWishlistFromServer]);

  const handleRemoveFromWishlist = async (productId: string) => {
    await toggleWishlist(productId);
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(product, 1);
  };

  const handleAddAllToCart = async () => {
    for (const item of items) {
      await addToCart(item.product_id, 1);
    }
    toast.success('Đã thêm tất cả sản phẩm vào giỏ hàng!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-96 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Danh sách yêu thích</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <Heart className="inline w-8 h-8 mr-2 text-red-500" />
            Danh sách yêu thích ({items.length})
          </h1>
          {items.length > 0 && (
            <Button
              onClick={handleAddAllToCart}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm tất cả vào giỏ hàng
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Heart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">Danh sách yêu thích của bạn đang trống.</p>
            <Link href="/products">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-gray-100">
                  <Link href={`/products/${item.product_id._id}`}>
                    <Image
                      src={item.product_id.images.mainImg.url}
                      alt={item.product_id.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.product_id._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    href={`/products/${item.product_id._id}`}
                    className="font-medium text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer mb-2 block"
                  >
                    {item.product_id.title || item.product_id.name}
                  </Link>

                  {/* Specs */}
                  {item.product_id.specifications && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                      {item.product_id.specifications.cpu || 
                       item.product_id.specifications.processor || 
                       Object.values(item.product_id.specifications)[0]}
                    </p>
                  )}

                  {/* Price */}
                  <p className="text-lg font-bold text-gray-900 mb-3">
                    ${item.product_id.price.toLocaleString("en-US")}
                  </p>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => handleAddToCart(item.product_id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
