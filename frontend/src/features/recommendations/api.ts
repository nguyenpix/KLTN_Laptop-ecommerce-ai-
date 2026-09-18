import { API_URL } from '@/constants/api-url';
import type {
  RecommendationsResponse,
  TrackViewPayload,
  TrackCartPayload,
  TrackFeedbackPayload,
  TrackOrderPayload,
  UserInteractionsResponse,
  SimilarProductsResponse,
} from './types';

/**
 * RECOMMENDATIONS API
 * Tích hợp với Backend Recommendation System (Phase 2 - Lazy Init)
 */

class RecommendationsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Create headers with authentication
   */
  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 🎯 GET RECOMMENDATIONS (Main API)
   * Lazy init sẽ tự động tạo profile nếu user chưa có
   * 
   * @param limit - Số lượng recommendations (default: 10)
   * @returns Personalized recommendations
   */
  async getRecommendations(limit: number = 10): Promise<RecommendationsResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/recommendations?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendationsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * 💻 GET SIMILAR PRODUCTS
   * Gợi ý laptop tương tự về cấu hình phần cứng từ Item Tower của mô hình AI
   * 
   * @param productId - ID sản phẩm cần tìm tương tự
   * @param limit - Số lượng gợi ý (default: 5)
   */
  async getSimilarProducts(productId: string, limit: number = 5): Promise<SimilarProductsResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/recommendations/similar/${productId}?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimilarProductsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw error;
    }
  }

  /**
   * 📊 TRACK VIEW INTERACTION
   * Ghi nhận khi user xem sản phẩm
   * 
   * @param payload - Product ID và duration
   */
  async trackView(payload: TrackViewPayload): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/interactions/view`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('Failed to track view interaction');
      }
    } catch (error) {
      console.error('Error tracking view:', error);
      // Không throw để không làm gián đoạn UX
    }
  }

  /**
   * ❤️ TRACK LIKE/UNLIKE
   * Ghi nhận khi user like/unlike sản phẩm
   */
  async toggleLike(productId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/like/${productId}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track like interaction');
      }
    } catch (error) {
      console.error('Error tracking like:', error);
    }
  }

  /**
   * 🛒 TRACK ADD TO CART
   * Ghi nhận khi user thêm sản phẩm vào giỏ hàng
   */
  async trackAddToCart(payload: TrackCartPayload): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/cart/add`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track add to cart');
      }
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  }

  /**
   * 🗑️ TRACK REMOVE FROM CART
   */
  async trackRemoveFromCart(itemId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/cart/${itemId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track remove from cart');
      }
    } catch (error) {
      console.error('Error tracking remove from cart:', error);
    }
  }

  /**
   * ⭐ TRACK RATING/FEEDBACK
   * Ghi nhận đánh giá của user
   */
  async trackFeedback(payload: TrackFeedbackPayload): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/feedback`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track feedback');
      }
    } catch (error) {
      console.error('Error tracking feedback:', error);
    }
  }

  /**
   * 💳 TRACK ORDER/PURCHASE
   * Ghi nhận khi user hoàn tất đơn hàng
   */
  async trackOrder(payload: TrackOrderPayload): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/order`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.warn('Failed to track order');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
    }
  }

  /**
   * 📈 GET USER INTERACTIONS HISTORY
   * Lấy lịch sử tương tác của user
   */
  async getUserInteractions(): Promise<UserInteractionsResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions/history`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user interactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const recommendationsAPI = new RecommendationsAPI();

// Export class for testing
export { RecommendationsAPI };
