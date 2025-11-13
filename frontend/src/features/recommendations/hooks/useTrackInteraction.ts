'use client';

import { useCallback } from 'react';
import { recommendationsAPI } from '../api';
import type {
  TrackViewPayload,
  TrackCartPayload,
  TrackFeedbackPayload,
  TrackOrderPayload,
} from '../types';

interface UseTrackInteractionReturn {
  trackView: (productId: string, duration?: number) => Promise<void>;
  trackAddToCart: (payload: Omit<TrackCartPayload, 'action'>) => Promise<void>;
  trackRemoveFromCart: (itemId: string) => Promise<void>;
  toggleLike: (productId: string) => Promise<void>;
  trackFeedback: (payload: TrackFeedbackPayload) => Promise<void>;
  trackOrder: (payload: TrackOrderPayload) => Promise<void>;
}

/**
 * 🎯 HOOK: useTrackInteraction
 * Track user interactions để cải thiện recommendations
 * 
 * Backend tự động update user profile sau mỗi interaction:
 * - 10 interactions → profile quality: low
 * - 30 interactions → profile quality: medium
 * - 50 interactions → profile quality: high
 * 
 * @example
 * ```tsx
 * const { trackView, trackAddToCart } = useTrackInteraction();
 * 
 * // Track khi user xem product
 * useEffect(() => {
 *   trackView(productId, 5000); // 5 seconds
 * }, [productId]);
 * 
 * // Track khi user add to cart
 * const handleAddToCart = async () => {
 *   await trackAddToCart({ product_id: productId, quantity: 1, price: 15000000 });
 * };
 * ```
 */
export function useTrackInteraction(): UseTrackInteractionReturn {
  /**
   * Track product view
   */
  const trackView = useCallback(async (productId: string, duration?: number) => {
    try {
      const payload: TrackViewPayload = {
        product_id: productId,
        duration,
      };
      await recommendationsAPI.trackView(payload);
      console.log(' Tracked view:', productId);
    } catch (error) {
      console.error(' Error tracking view:', error);
      // Không throw error để không break UI
    }
  }, []);

  /**
   * Track add to cart
   */
  const trackAddToCart = useCallback(
    async (payload: Omit<TrackCartPayload, 'action'>) => {
      try {
        await recommendationsAPI.trackAddToCart(payload);
        console.log(' Tracked add to cart:', payload.product_id);
      } catch (error) {
        console.error(' Error tracking add to cart:', error);
      }
    },
    []
  );

  /**
   * Track remove from cart
   */
  const trackRemoveFromCart = useCallback(async (itemId: string) => {
    try {
      await recommendationsAPI.trackRemoveFromCart(itemId);
      console.log(' Tracked remove from cart:', itemId);
    } catch (error) {
      console.error(' Error tracking remove from cart:', error);
    }
  }, []);

  /**
   * Track like/unlike product
   */
  const toggleLike = useCallback(async (productId: string) => {
    try {
      await recommendationsAPI.toggleLike(productId);
      console.log(' Tracked like toggle:', productId);
    } catch (error) {
      console.error(' Error tracking like:', error);
    }
  }, []);

  /**
   * Track product feedback
   */
  const trackFeedback = useCallback(async (payload: TrackFeedbackPayload) => {
    try {
      await recommendationsAPI.trackFeedback(payload);
      console.log(' Tracked feedback:', payload);
    } catch (error) {
      console.error(' Error tracking feedback:', error);
    }
  }, []);

  /**
   * Track completed order
   */
  const trackOrder = useCallback(async (payload: TrackOrderPayload) => {
    try {
      await recommendationsAPI.trackOrder(payload);
      console.log(' Tracked order:', payload);
    } catch (error) {
      console.error(' Error tracking order:', error);
    }
  }, []);

  return {
    trackView,
    trackAddToCart,
    trackRemoveFromCart,
    toggleLike,
    trackFeedback,
    trackOrder,
  };
}
