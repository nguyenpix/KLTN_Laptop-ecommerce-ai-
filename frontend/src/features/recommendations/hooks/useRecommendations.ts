'use client';

import { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api';
import type { ProductRecommendation, RecommendationMetadata } from '../types';

interface UseRecommendationsOptions {
  limit?: number;
  productId?: string; // Khi có productId: lấy laptop tương tự từ Item Tower của mô hình AI
  enabled?: boolean; // Cho phép enable/disable fetch
  refetchOnMount?: boolean;
}

interface UseRecommendationsReturn {
  recommendations: ProductRecommendation[];
  isLoading: boolean;
  error: Error | null;
  metadata: RecommendationMetadata | null;
  refetch: () => Promise<void>;
}

/**
 * 🎯 HOOK: useRecommendations
 * Lấy danh sách gợi ý từ mô hình AI (Cá nhân hóa cho User hoặc Laptop tương tự theo Product ID)
 */
export function useRecommendations(
  options: UseRecommendationsOptions = {}
): UseRecommendationsReturn {
  const { limit = 10, productId, enabled = true, refetchOnMount = true } = options;

  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendations = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      if (productId) {
        // Gợi ý sản phẩm tương tự dựa trên Item Tower / Hybrid Sim
        const simRes = await recommendationsAPI.getSimilarProducts(productId, limit);
        if (simRes.success) {
          const simList = Array.isArray(simRes.data)
            ? simRes.data
            : (simRes.data?.similar_products || []);
          setRecommendations(simList);
        } else {
          throw new Error('Failed to fetch similar products');
        }
      } else {
        // Gợi ý cá nhân hóa dựa trên mô hình Hybrid / Two-Tower
        const response = await recommendationsAPI.getRecommendations(limit);
        if (response.success) {
          const list = Array.isArray(response.data)
            ? response.data
            : (response.data?.recommendations || []);
          setRecommendations(list);
          setMetadata(response.data?.embedding_metadata || (response as any).metadata || null);
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error in useRecommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, productId, enabled]);

  return {
    recommendations,
    isLoading,
    error,
    metadata,
    refetch: fetchRecommendations,
  };
}
