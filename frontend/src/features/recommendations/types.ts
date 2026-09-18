// Types for Recommendation System
export interface RecommendationMetadata {
  quality: 'default' | 'low' | 'medium' | 'high';
  source: string;
  interaction_count: number;
  base_product_count?: number;
}

/**
 * ProductRecommendation - Định dạng sản phẩm gợi ý trả về từ Model AI
 */
export interface ProductRecommendation {
  productId: string;
  product_id?: string;
  id?: number;
  name: string;
  title?: string;
  price: number;
  image?: string;
  images?: {
    mainImg?: {
      url: string;
      alt_text?: string;
    };
    sliderImg?: Array<{
      url: string;
      alt_text?: string;
    }>;
  };
  brand?: string;
  category?: string;
  score?: number;
  similarity_score?: number;
  final_score?: number;
  algorithm?: string;
  reason?: string;
  specifications?: Record<string, any>;
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    recommendations: ProductRecommendation[];
    algorithm: string;
    user_id?: string | null;
    total: number;
    is_cold_start?: boolean;
    generated_at: string;
    embedding_metadata?: RecommendationMetadata;
  };
}

export interface SimilarProductsResponse {
  success: boolean;
  data: {
    similar_products: ProductRecommendation[];
    count: number;
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
  metadata?: Record<string, unknown>;
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
