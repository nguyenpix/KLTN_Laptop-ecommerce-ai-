'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductRecommendation } from '../types';

interface RecommendationCardProps {
  recommendation: ProductRecommendation;
  onView?: (productId: string) => void;
  onLike?: (productId: string) => void;
  onAddToCart?: (productId: string, price: number) => void;
}

/**
 * 🎴 COMPONENT: RecommendationCard
 * Hiển thị một product recommendation
 * 
 * Features:
 * - Product image, name, price
 * - Recommendation score & reason
 * - Like button
 * - Add to cart button
 * - Auto-track view on mount
 */
export function RecommendationCard({
  recommendation,
  onView,
  onLike,
  onAddToCart,
}: RecommendationCardProps) {
  // Format mới: recommendation chứa trực tiếp productId, name, price, image, brand
  const { productId, name, price, image, brand, final_score, reason } = recommendation;

  React.useEffect(() => {
    // Track view khi card được render
    if (onView) {
      onView(productId);
    }
  }, [productId, onView]);

  const formatPrice = (priceValue: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(priceValue);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(productId, price);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLike) {
      onLike(productId);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Score Badge */}
      <div className="absolute right-2 top-2 z-10 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
        {Math.round(final_score * 100)}% Match
      </div>

      {/* Product Image */}
      <Link href={`/products/${productId}`} className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={image || '/placeholder.jpg'}
          alt={name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        {brand && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {brand}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/products/${productId}`}>
          <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
            {name}
          </h3>
        </Link>

        {/* Recommendation Reason */}
        {reason && (
          <p className="mt-2 text-xs text-blue-600 italic">
            💡 {reason}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-4">
          <p className="text-lg font-bold text-gray-900">{formatPrice(price)}</p>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleLike}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Like product"
          >
            ❤️ Like
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
