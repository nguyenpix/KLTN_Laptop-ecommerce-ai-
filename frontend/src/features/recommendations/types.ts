// Types for Recommendation System
export interface RecommendationMetadata {
  quality: 'default' | 'low' | 'medium' | 'high';
  source: string;
  interaction_count: number;
  base_product_count?: number;
}

/**
 * ProductRecommendation - Format mới (lightweight)
 * Backend chỉ trả về info cơ bản, client tự fetch details nếu cần
 */
export interface ProductRecommendation {
  productId: string;
  name: string;
  price: number;
  image?: string; // URL của mainImg
  brand?: string; // Tên brand
  content_score: number;
  collaborative_score?: number;
  final_score: number;
  reason?: string;
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    recommendations: ProductRecommendation[];
    algorithm: string;
    user_id: string;
    generated_at: string;
    embedding_metadata?: RecommendationMetadata;
  };
}

// ================== INTERACTION TRACKING PAYLOADS ==================

/**
 * Track product view payload
 */
export interface TrackViewPayload {
  product_id: string;
  duration?: number;
  source?: string;
}

/**
 * Track add/remove cart payload
 */
export interface TrackCartPayload {
  product_id: string;
  quantity: number;
  price?: number;
}

/**
 * Track feedback/rating payload
 */
export interface TrackFeedbackPayload {
  product_id: string;
  rating: number;
  comment: string;
  wishlist?: boolean;
}

/**
 * Track order payload
 */
export interface TrackOrderPayload {
  total_amount: number;
  items: Array<{
    laptop_id: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: string;
  payment_method: string;
}

/**
 * User interaction history item
 */
export interface UserInteraction {
  _id: string;
  userId: string;
  productId: {
    _id: string;
    name: string;
    images: {
      mainImg: {
        url: string;
      };
    };
    price: number;
    salePrice?: number;
  };
  type: 'view' | 'like' | 'add_to_cart' | 'remove_from_cart' | 'rating' | 'purchase';
  weight: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserInteractionsResponse {
  success: boolean;
  data: {
    interactions: UserInteraction[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}
