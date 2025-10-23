'use client';

import { useState, useEffect } from 'react';
import { recommendationsAPI } from '../api';
import type { ProductRecommendation, RecommendationMetadata } from '../types';

interface UseRecommendationsOptions {
  limit?: number;
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
 * Lấy personalized recommendations cho user
 * 
 * Features:
 * - Lazy initialization (backend tự động tạo profile nếu chưa có)
 * - Auto-refetch on mount (optional)
 * - Manual refetch
 * - Loading & error states
 * 
 * @example
 * ```tsx
 * const { recommendations, isLoading, refetch } = useRecommendations({ limit: 10 });
 * ```
 */
export function useRecommendations(
  options: UseRecommendationsOptions = {}
): UseRecommendationsReturn {
  const { limit = 10, enabled = true, refetchOnMount = true } = options;

  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendations = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationsAPI.getRecommendations(limit);
      
      if (response.success) {
        setRecommendations(response.data.recommendations);
        setMetadata(response.data.embedding_metadata || null);
      } else {
        throw new Error('Failed to fetch recommendations');
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
  }, [limit, enabled]);

  return {
    recommendations,
    isLoading,
    error,
    metadata,
    refetch: fetchRecommendations,
  };
}
