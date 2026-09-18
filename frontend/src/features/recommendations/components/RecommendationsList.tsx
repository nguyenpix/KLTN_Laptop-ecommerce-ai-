'use client';

import React from 'react';
import { useRecommendations, useTrackInteraction } from '../hooks';
import { RecommendationCard } from './RecommendationCard';
import ProductCard from '@/features/products/components/ProductCard';

interface RecommendationsListProps {
  limit?: number;
  productId?: string; // Nếu có: hiển thị laptop tương tự từ Item Tower của mô hình AI
  title?: string;
  showMetadata?: boolean;
}

/**
 * 📋 COMPONENT: RecommendationsList
 * Container cho danh sách recommendations (Cá nhân hóa hoặc Laptop tương tự)
 */
export function RecommendationsList({
  limit = 10,
  productId,
  title = 'Sản phẩm dành riêng cho bạn',
  showMetadata = true,
}: RecommendationsListProps) {
  const { recommendations, isLoading, error, metadata, refetch } = useRecommendations({ limit, productId });
  const { trackView, toggleLike, trackAddToCart } = useTrackInteraction();

  const handleView = React.useCallback(
    (productId: string) => {
      trackView(productId, 3000); // 3 seconds default view time
    },
    [trackView]
  );

  const handleLike = React.useCallback(
    (productId: string) => {
      toggleLike(productId);
    },
    [toggleLike]
  );

  const handleAddToCart = React.useCallback(
    (productId: string, price: number) => {
      trackAddToCart({
        product_id: productId,
        quantity: 1,
        price,
      });
    },
    [trackAddToCart]
  );

  if (isLoading) {
    return (
      <div className="w-full py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Đang tải recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-800"> Không thể tải recommendations</p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-600">📦 Chưa có recommendations</p>
          <p className="text-sm text-gray-500">
            Hãy xem và tương tác với sản phẩm để nhận gợi ý phù hợp nhất!
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showMetadata && metadata && (
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                📊 Quality:
                <span className={`font-semibold ${getQualityColor(metadata.quality)}`}>
                  {metadata.quality.toUpperCase()}
                </span>
              </span>
              <span>•</span>
              <span>🔄 {metadata.interaction_count} interactions</span>
              {metadata.base_product_count && (
                <>
                  <span>•</span>
                  <span>🎯 Based on {metadata.base_product_count} products</span>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recommendations.map((recommendation: any) => {
          const pId = recommendation._id?.toString() || recommendation.productId || recommendation.product_id || '';
          const pName = recommendation.name || recommendation.title || 'Laptop';
          const imgUrl = recommendation.images?.mainImg?.url || recommendation.image || '/placeholder.jpg';
          const brandName = recommendation.brand_id?.name || recommendation.brand || '';
          const matchPercent = 
            recommendation.hybrid_score?.match_percentage
            || recommendation.similarity?.match_percentage
            || (recommendation.hybrid_score?.final_score !== undefined
                ? Math.round(recommendation.hybrid_score.final_score * 100)
                : (recommendation.similarity?.score !== undefined
                    ? Math.round(recommendation.similarity.score * 100)
                    : (recommendation.final_score !== undefined
                        ? Math.round(recommendation.final_score * 100)
                        : (recommendation.similarity_score !== undefined
                            ? Math.round(recommendation.similarity_score * 100)
                            : 90))));

          const productForCard = {
            _id: pId,
            id: recommendation.id || 0,
            title: pName,
            name: pName,
            description: recommendation.description || '',
            price: recommendation.price || 0,
            sku: recommendation.sku || '',
            images: {
              mainImg: {
                url: imgUrl,
                alt_text: pName,
              },
              sliderImg: recommendation.images?.sliderImg || [],
            },
            specifications: recommendation.specifications || {},
            color: recommendation.color || '',
            brand: brandName,
            faqs: recommendation.faqs || [],
            part_number: recommendation.part_number || '',
            series: recommendation.series || '',
            category_id: recommendation.category_id || [],
          };
          
          return (
            <ProductCard 
              key={pId} 
              product={productForCard} 
              badge={`${matchPercent}% Match`}
            />
          );
        })}
      </div>

      {/* Footer Info */}
      {showMetadata && metadata?.quality === 'default' && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Đây là recommendations mặc định. Hãy xem, like và mua sắm
            thêm để nhận được gợi ý cá nhân hóa chính xác hơn!
            <br />
            <span className="text-xs text-blue-600">
              10 interactions → Low quality | 30 interactions → Medium | 50+ interactions → High quality
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Helper: Get quality badge color
 */
function getQualityColor(quality: string): string {
  switch (quality) {
    case 'high':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-orange-600';
    case 'default':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}
